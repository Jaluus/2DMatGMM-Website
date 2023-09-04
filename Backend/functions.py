import gzip
import json
import os
import re
import shutil
import sys
import uuid
from io import BytesIO
from zipfile import ZipFile

import cv2
import numpy as np
from flask import jsonify, make_response
from sqlalchemy.orm import scoped_session

from database.models import Chip, Flake, Image, Scan

SCALE_LENGTH = {
    "2.5x": ["1mm", 325],
    "5x": ["500um", 325],
    "20x": ["125um", 325],
    "50x": ["50um", 325],
    "100x": ["25um", 325],
}


def sorted_alphanumeric(data):
    """
    sorts an array of strings alphanumericly
    """

    def convert(text):
        return int(text) if text.isdigit() else text.lower()

    def alphanum_key(key):
        return [convert(c) for c in re.split("([0-9]+)", key)]

    return sorted(data, key=alphanum_key)


def create_compressed_response(array: list):
    content = gzip.compress(jsonify(array).data)
    response = make_response(content)
    response.headers["Content-Encoding"] = "gzip"
    response.headers["Content-Type"] = "application/json"
    response.headers["Content-length"] = len(content)
    return response


def build_filter_query(query_dict: dict):
    QUERYABLE_ATTRIBUTES_EXACT = {
        "flake_id": Flake._id,
        "flake_thickness": Flake.thickness,
        "flake_favorite": Flake.favorite,
        "flake_used": Flake.used,
        "chip_id": Chip._id,
        "chip_wafer": Chip.wafer,
        "chip_material": Chip.material,
        "scan_id": Scan._id,
        "scan_name": Scan.name,
        "scan_user": Scan.user,
    }

    QUERYABLE_ATTRIBUTES_NON_EXACT_MIN = {
        "flake_size_min": Flake.size,
        "flake_entropy_min": Flake.entropy,
        "flake_max_sidelength_min": Flake.max_sidelength,
        "flake_min_sidelength_min": Flake.min_sidelength,
        "flake_false_positive_probability_min": Flake.false_positive_probability,
        "scan_time_min": Scan.time,
    }

    QUERYABLE_ATTRIBUTES_NON_EXACT_MAX = {
        "flake_size_max": Flake.size,
        "flake_entropy_max": Flake.entropy,
        "flake_max_sidelength_max": Flake.max_sidelength,
        "flake_min_sidelength_max": Flake.min_sidelength,
        "flake_false_positive_probability_max": Flake.false_positive_probability,
        "scan_time_max": Scan.time,
    }

    ####### Extract the querys from the query_dict and assign the Values #######
    attribute_querys_exact = {
        QUERYABLE_ATTRIBUTES_EXACT[attribute]: query_dict[attribute]
        for attribute in query_dict
        if attribute in QUERYABLE_ATTRIBUTES_EXACT.keys()
    }
    attribute_querys_non_exact_min = {
        QUERYABLE_ATTRIBUTES_NON_EXACT_MIN[attribute]: query_dict[attribute]
        for attribute in query_dict
        if attribute in QUERYABLE_ATTRIBUTES_NON_EXACT_MIN.keys()
    }
    attribute_querys_non_exact_max = {
        QUERYABLE_ATTRIBUTES_NON_EXACT_MAX[attribute]: query_dict[attribute]
        for attribute in query_dict
        if attribute in QUERYABLE_ATTRIBUTES_NON_EXACT_MAX.keys()
    }

    ####### BUILD THE FILTER QUERYS #######
    filter_querys = []
    for attribute, value in attribute_querys_exact.items():
        filter_querys.append(attribute == value)
    for attribute, value in attribute_querys_non_exact_min.items():
        filter_querys.append(attribute >= value)
    for attribute, value in attribute_querys_non_exact_max.items():
        filter_querys.append(attribute <= value)
    return filter_querys


def extract_pagination(query_dict: dict):
    page = 1
    query_limit = 5000
    if "query_limit" in query_dict:
        try:
            query_limit_test = int(query_dict["query_limit"])
        except ValueError:
            raise ValueError(
                f"Cant convert 'query_limit' with value '{query_dict['query_limit']}' to int"
            )
        assert query_limit_test > 0, "Query limit must be greaterthan 0"
        query_limit = query_limit_test

    if "page" in query_dict:
        try:
            page_test = int(query_dict["page"])
        except ValueError:
            raise ValueError(
                f"Cant convert 'page' with value '{query_dict['page']}' to int"
            )
        assert page_test > 0, "Page must be greater than 0"
        page = page_test

    return page, query_limit


def get_flakes(db: scoped_session, query_dict: dict):
    ORDER_BY = Flake._id

    try:
        filter_querys = build_filter_query(query_dict)
        # page, query_limit = extract_pagination(query_dict)

        # Run the Query
        flakes = (
            db.query(Flake)
            .join(Chip)
            .join(Scan)
            .filter(*filter_querys)
            .order_by(ORDER_BY)
            # .offset((page - 1) * query_limit)
            # .limit(query_limit)
            .all()
        )

        return [flake.get_full_dict() for flake in flakes]
    except KeyError as ke:
        print(ke)
        return []
    except OSError as e:
        print(e)
        return []


def save_file_to_disk(file, save_dir):
    print(f"Received {file.filename}")
    if file.filename[-4:] != ".zip":
        raise Exception("File is not a Zipfile")

    scan_path_zip = os.path.join(save_dir, file.filename)
    scan_path = os.path.join(save_dir, file.filename[:-4])

    print(f"Saving ZIP-file to {scan_path_zip}...", end="")
    file.save(scan_path_zip)
    print(f"Done")

    # Check if the foldername already exists in the Folder
    # if does ,rename the new folder
    print(f"Checking if {scan_path} already exists")
    if os.path.exists(scan_path):
        print(f"WARNING: {scan_path} already exists!")
        scan_path = scan_path + "-" + uuid.uuid4().hex
        print(f"Renaming to {scan_path} to avoid overwriting")

    # Extracting the Zipfile to the folder
    print(f"Extracting ZIP-file to {scan_path}...", end="")
    with ZipFile(scan_path_zip, "r") as zipObj:
        zipObj.extractall(scan_path)
    print(f"Done")

    # Remove the Zipfile from the folder
    print(f"Removing {scan_path_zip} to save space...", end="")
    os.remove(scan_path_zip)
    print(f"Done")

    return scan_path


def upload_scan_directory_to_db(db: scoped_session, scan_directory: str):
    print(f"Uploading {scan_directory} to DB...", end="\n")
    scan_meta_path = os.path.join(scan_directory, "meta.json")
    scan_name = os.path.basename(scan_directory)

    with open(scan_meta_path) as f:
        scan_meta = json.load(f)

    # currently we only support one exfoliated material
    material = None
    if "scan_exfoliated_material" in scan_meta.keys():
        material = scan_meta["scan_exfoliated_material"]

    # # Really Scuffed Extraction of Data
    comment = None
    if "scan_exfoliation_method" in scan_meta.keys():
        comment = scan_meta["scan_exfoliation_method"]
    if "comment" in scan_meta.keys():
        comment = scan_meta["comment"]

    scan = Scan(
        name=scan_name,
        user=scan_meta["scan_user"],
        time=scan_meta["scan_time"],
        comment=comment,
    )
    db.add(scan)
    db.commit()
    scan_id = scan._id

    chip_directory_names = [
        chip_directory_name
        for chip_directory_name in sorted_alphanumeric(os.listdir(scan_directory))
        if os.path.isdir(os.path.join(scan_directory, chip_directory_name))
    ]

    for chip_directory_name in chip_directory_names:
        chip_directory = os.path.join(scan_directory, chip_directory_name)

        # Create a new chip and push it to the DB
        chip = Chip(
            scan_id=scan_id, wafer=scan_meta["chip_thickness"], material=material,
        )
        db.add(chip)
        db.commit()
        chip_id = chip._id

        flake_directory_names = [
            flake_directory_name
            for flake_directory_name in sorted_alphanumeric(os.listdir(chip_directory))
            if os.path.isdir(os.path.join(chip_directory, flake_directory_name))
        ]

        for flake_directory_name in flake_directory_names:
            flake_directory = os.path.join(chip_directory, flake_directory_name)

            meta_path = os.path.join(flake_directory, "meta.json")
            with open(meta_path, "r") as f:
                meta_data = json.load(f)
                flake_data = meta_data["flake"]
                image_data = meta_data["images"]

            if "false_positive_probability" not in flake_data.keys():
                flake_data["false_positive_probability"] = 0.0

            flake_path = os.path.join(
                scan_name, chip_directory_name, flake_directory_name
            )

            flake = Flake(
                chip_id=chip_id,
                position_x=flake_data["position_x"],
                position_y=flake_data["position_y"],
                size=flake_data["size"],
                thickness=flake_data["thickness"],
                entropy=flake_data["entropy"],
                max_sidelength=flake_data["max_sidelength"],
                min_sidelength=flake_data["min_sidelength"],
                false_positive_probability=flake_data["false_positive_probability"],
                path=flake_path,
            )
            db.add(flake)
            db.commit()

            flake_id = flake._id

            for magnification, image_properties in image_data.items():
                current_image = Image(
                    flake_id=flake_id,
                    aperture=image_properties["aperture"],
                    light_voltage=image_properties["light"],
                    magnification=image_properties["nosepiece"],
                    gamma=image_properties["gamma"],
                    gain=image_properties["gain"],
                    exposure_time=image_properties["exposure"],
                    white_balance_r=image_properties["white_balance"][0],
                    white_balance_g=image_properties["white_balance"][1],
                    white_balance_b=image_properties["white_balance"][2],
                )
                db.add(current_image)
                db.commit()
    print(f"Done")


def get_scans(db: scoped_session, query_dict: dict):
    ORDER_BY = Scan._id

    try:
        filter_querys = build_filter_query(query_dict)
        # page, query_limit = extract_pagination(query_dict)

        # Run the Query
        scans = (
            db.query(Scan)
            .join(Chip)
            .join(Flake)
            .filter(*filter_querys)
            .order_by(ORDER_BY.desc())
            # .offset((page - 1) * query_limit)
            # .limit(3000)
            .all()
        )

        return [scan.get_full_dict() for scan in scans]
    except KeyError as ke:
        print(ke)
        return []
    except OSError as e:
        print(e)
        return []


def get_chips(db: scoped_session, query_dict: dict):
    ORDER_BY = Chip._id

    try:
        filter_querys = build_filter_query(query_dict)
        # page, query_limit = extract_pagination(query_dict)

        # Run the Query
        chips = (
            db.query(Chip)
            .join(Scan)
            .join(Flake)
            .filter(*filter_querys)
            .order_by(ORDER_BY)
            # .offset((page - 1) * query_limit)
            # .limit(query_limit)
            .all()
        )

        return [chip.get_full_dict() for chip in chips]
    except KeyError as ke:
        print(ke)
        return []
    except OSError as e:
        print(e)
        return []


def toggle_flake_favorite(db: scoped_session, flake_id: int):
    try:
        current_flake = db.get(Flake, flake_id)
        current_flake.favorite = not current_flake.favorite
        db.commit()
    except AttributeError:
        raise AttributeError(f"Flake with id {flake_id} does not exist")


def toggle_flake_used(db: scoped_session, flake_id: int):
    try:
        current_flake = db.get(Flake, flake_id)
        current_flake.used = not current_flake.used
        db.commit()
    except AttributeError:
        raise AttributeError(f"Flake with id {flake_id} does not exist")


def get_scan_stats(db: scoped_session, scan_id: int):
    try:
        chip_keys = ["wafer", "material"]
        flake_keys = [
            "entropy",
            "false_positive_probability",
            "size",
            "thickness",
            "used",
            "favorite",
        ]
        current_scan: Scan = db.get(Scan, scan_id)
        scan_dict = current_scan.to_dict()

        chip_dicts = []
        scan_chips = current_scan.chips
        for chip in scan_chips:
            chip_dict = chip.to_dict()
            chip_dict = {key: chip_dict[key] for key in chip_keys}

            chip_flakes = chip.flakes
            flake_dicts = []
            for flake in chip_flakes:
                flake_dict = flake.to_dict()
                flake_dict = {key: flake_dict[key] for key in flake_keys}
                flake_dicts.append(flake_dict)

            chip_dict["flakes"] = flake_dicts
            chip_dicts.append(chip_dict)

        scan_dict["chips"] = chip_dicts

        return scan_dict
    except AttributeError:
        raise AttributeError(f"Scan with id {scan_id} does not exist")


def update_scan_info(
    db: scoped_session, scan_id: int, comment: str, user: str, name: str,
):
    try:
        current_scan = db.get(Scan, scan_id)
        if comment is not None:
            current_scan.comment = comment
        if user is not None:
            current_scan.user = user
        if name is not None:
            current_scan.name = name
        db.commit()
    except AttributeError:
        raise AttributeError(f"Scan with id {scan_id} does not exist")


def get_unique_material_thickness_combinations_dict(db: scoped_session):
    unique_combinations = np.array(
        (db.query(Flake.thickness, Chip.material).join(Chip).distinct().all())
    )

    # create a dictionary with the material as key and the thicknesses as values
    material_thickness_dict = {}
    materials = unique_combinations[:, 1]
    for material in materials:
        material_thickness_dict[material] = unique_combinations[
            unique_combinations[:, 1] == material
        ][:, 0].tolist()

    # sort the thicknesses
    for material in materials:
        material_thickness_dict[material].sort()

    return material_thickness_dict


def delete_flake(db: scoped_session, flake_id: int, image_dir: str):
    try:
        flake = db.get(Flake, flake_id)
        flake_dir = os.path.join(image_dir, flake.path)
        assert os.path.exists(flake_dir), f"Flake directory {flake_dir} does not exist"
        shutil.rmtree(flake_dir)

        # the cascade delete deletes the images as well
        db.delete(flake)
        db.commit()
    except AttributeError:
        raise AttributeError(f"Flake with id {flake_id} does not exist")
    except OSError as e:
        raise OSError(e)
    except AssertionError as ae:
        raise AssertionError(ae)


def delete_chip(db: scoped_session, chip_id: int, image_dir: str):
    try:
        chip = db.get(Chip, chip_id)

        # we split the path to get the directory of the chip
        # if the path is a windows path we split by \ else by /
        # we know this by the length of the array
        flake_path = chip.flakes[0].path
        norm_path = os.path.normpath(flake_path).replace("\\", "/").split("/")
        chip_path = "/".join(norm_path[:-1])
        chip_dir = os.path.join(image_dir, chip_path)
        assert os.path.exists(
            chip_dir
        ), f"Chip directory {chip_dir} does not exist, check if the path is correct, do also check if / or \\ is used as path separator"

        shutil.rmtree(chip_dir)

        # the cascade delete deletes the children as well
        db.delete(chip)
        db.commit()
    except AttributeError:
        raise AttributeError(f"Chip with id {chip_id} does not exist")
    except OSError as e:
        raise OSError(e)
    except AssertionError as ae:
        raise AssertionError(ae)


def delete_scan(db: scoped_session, scan_id: int, image_dir: str):
    try:
        scan = db.get(Scan, scan_id)
        scan_dir = os.path.join(image_dir, scan.name)

        assert os.path.exists(
            scan_dir
        ), f"Scan directory {scan_dir} does not exist, check if the path is correct"

        shutil.rmtree(scan_dir)

        # the cascade delete deletes the children as well
        db.delete(scan)
        db.commit()

    except AttributeError:
        raise AttributeError(f"scan with id {scan_id} does not exist")
    except OSError as e:
        raise OSError(e)
    except AssertionError as ae:
        raise AssertionError(ae)


def add_scalebar(file_path):
    img = cv2.imread(file_path)
    file_dir = os.path.dirname(file_path)
    img_name = os.path.basename(file_path).split(".")[0]
    img_scalebar_name = f"{img_name}_scalebar.png"
    img_scalebar_path = os.path.join(file_dir, img_scalebar_name)

    X1, Y1 = 50, 50
    X2, Y2 = SCALE_LENGTH[img_name][1] + X1, 70

    img = cv2.rectangle(img, (X1, Y1), (X2, Y2), (255, 255, 255), thickness=-1)

    cv2.putText(
        img,
        SCALE_LENGTH[img_name][0],
        (50, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        2,
        (255, 255, 255),
        4,
    )

    cv2.imwrite(img_scalebar_path, img)
    return img_scalebar_path


def create_memory_file(
    flake: Flake, download_scalebar: bool, image_dir: str,
):
    try:
        flake_path = os.path.normpath(flake.path).replace("\\", "/")
        flake_dir = os.path.join(image_dir, flake_path)
        assert os.path.exists(flake_dir), f"Flake directory {flake_dir} does not exist"

        # Create a ZIP-file in memory
        memory_file = BytesIO()
        with ZipFile(memory_file, "w") as zf:
            # Iterate over all the files in directory
            for folderName, subfolders, filenames in os.walk(flake_dir):
                for filename in filenames:
                    # create complete filepath of file in directory
                    filePath = os.path.join(folderName, filename)

                    if (
                        download_scalebar
                        and filename.split(".")[0] in SCALE_LENGTH.keys()
                    ):
                        # add scalebar to the image
                        img_scalebar_path = add_scalebar(filePath)
                        zf.write(img_scalebar_path, arcname=filename)
                        os.remove(img_scalebar_path)
                    else:
                        zf.write(filePath, arcname=filename)
        memory_file.seek(0)

        return memory_file
    except AssertionError as ae:
        raise AssertionError(ae)

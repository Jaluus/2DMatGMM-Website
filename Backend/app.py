import json
import os
import re

from flask import Flask, request, send_file
from flask_cors import CORS

from database.database import db_session, init_db
from database.models import Chip, Flake, Image, Scan
from functions import (
    create_compressed_response,
    create_memory_file,
    delete_chip,
    delete_flake,
    delete_scan,
    get_chips,
    get_flakes,
    get_scan_stats,
    get_scans,
    get_unique_material_thickness_combinations_dict,
    save_file_to_disk,
    toggle_flake_favorite,
    toggle_flake_used,
    update_scan_info,
    upload_scan_directory_to_db,
)

FILE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(FILE_DIR, "config.json")
CONFIG = json.load(open(CONFIG_FILE))

# Where the images are stored on the server
IMAGE_DIRECTORY = CONFIG["image_directory"]

init_db()

# Apply CORS to all routes
app = Flask(__name__)
CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"
app.config["MAX_CONTENT_LENGTH"] = 32 * 1e9


# This runs after every request to terminate the database session
# This is IMPORTANT to prevent too many open connections to the database leading to a crash
@app.teardown_appcontext
def shutdown_session(exception=None):
    print("Closing database session")
    db_session.remove()


# Define the default route
@app.route("/")
def index():
    return "Welcome to the API"


@app.route("/flakes", methods=["DELETE"])
def FLAKE_DELETE():
    try:
        flake_id = int(request.args.get("flake_id"))
        delete_flake(db_session, flake_id, IMAGE_DIRECTORY)
        return f"Deleted Flake {flake_id}"
    except ValueError:
        return f"flake_id must be an integer and not '{request.args.get('flake_id')}'"
    except TypeError:
        return "flake_id must be provided"
    except AttributeError as e:
        return str(e)
    except AssertionError as e:
        return str(e)


@app.route("/chip", methods=["DELETE"])
def CHIP_DELETE():
    try:
        chip_id = int(request.args.get("chip_id"))
        delete_chip(db_session, chip_id, IMAGE_DIRECTORY)
        return f"Deleted Chip {chip_id}"
    except ValueError:
        return f"chip_id must be an integer and not '{request.args.get('chip_id')}'"
    except TypeError:
        return "chip_id must be provided"
    except AttributeError as e:
        return str(e)
    except AssertionError as e:
        return str(e)


@app.route("/scan", methods=["DELETE"])
def SCAN_DELETE():
    try:
        scan_id = int(request.args.get("scan_id"))
        delete_scan(db_session, scan_id, IMAGE_DIRECTORY)
        return f"Deleted Scan {scan_id}"
    except ValueError:
        return f"scan_id must be an integer and not '{request.args.get('scan_id')}'"
    except TypeError:
        return "scan_id must be provided"
    except AttributeError as e:
        return str(e)
    except AssertionError as e:
        return str(e)


# Define the the upload route, POST
@app.route("/upload", methods=["POST"])
def UPLOAD_FILES():
    print("Recieving File for Upload...")
    file = request.files["zip"]
    file_path_folder = save_file_to_disk(file, IMAGE_DIRECTORY)
    upload_scan_directory_to_db(db_session, file_path_folder)

    return "File uploaded successfully"


@app.route("/scans", methods=["GET"])
def SCAN_GET():
    query_dict = request.args
    scan_array = get_scans(db_session, query_dict)
    return create_compressed_response(scan_array)


@app.route("/chips", methods=["GET"])
def CHIP_GET():
    query_dict = request.args
    chip_array = get_chips(db_session, query_dict)
    return create_compressed_response(chip_array)


@app.route("/flakes", methods=["GET"])
def FLAKE_GET():
    query_dict = request.args
    flake_arrays = get_flakes(db_session, query_dict)
    return create_compressed_response(flake_arrays)


@app.route("/favorite", methods=["GET"])
def FLAKE_TOGGLE_FAVORITE():
    try:
        flake_id = int(request.args.get("flake_id"))
        toggle_flake_favorite(db_session, flake_id)
        return f"Toggled Favorited Flake {flake_id}"
    except ValueError:
        return f"flake_id must be an integer and not '{request.args.get('flake_id')}'"
    except TypeError:
        return "flake_id must be provided"
    except AttributeError:
        return f"Flake with id {flake_id} does not exist"


@app.route("/used", methods=["GET"])
def FLAKE_TOGGLE_USED():
    try:
        flake_id = int(request.args.get("flake_id"))
        toggle_flake_used(db_session, flake_id)
        return f"Toggled used Flake {flake_id}"
    except ValueError:
        return f"flake_id must be an integer and not '{request.args.get('flake_id')}'"
    except TypeError:
        return "flake_id must be provided"
    except AttributeError:
        return f"Flake with id {flake_id} does not exist"


@app.route("/scan", methods=["PUT"])
def SCAN_COMMENT_SET():
    try:
        scan_id = int(request.args.get("scan_id"))
        new_comment = None
        if not (request.json.get("scan_comment") is None):
            new_comment = str(request.json.get("scan_comment"))
            new_comment = re.sub(r"\\", "", new_comment)
            assert len(new_comment) < 255, "Comment must be less than 255 characters"

        new_user = None
        if not (request.json.get("scan_user") is None):
            new_user = str(request.json.get("scan_user"))
            new_user = re.sub(r"\\", "", new_user)
            assert len(new_user) < 255, "User must be less than 255 characters"

        new_name = None
        if not (request.json.get("scan_name") is None):
            new_name = str(request.json.get("scan_name"))
            new_name = re.sub(r"\\", "", new_name)
            assert len(new_name) < 255, "Scan Name must be less than 255 characters"

        if new_comment is None and new_user is None and new_name is None:
            return "No new values provided"
        update_scan_info(
            db_session, scan_id, new_comment, new_user, new_name,
        )
        return f"Updated Scan {scan_id}"
    except ValueError as ve:
        return f"scan_id must be an integer and not '{request.args.get('scan_id')}'"
    except AssertionError as ae:
        return str(ae)
    except AttributeError as ate:
        return str(ate)


@app.route("/stats/users", methods=["GET"])
def USER_GET():
    unique_users = db_session.query(Scan.user).distinct().all()
    return create_compressed_response([user[0] for user in unique_users])


@app.route("/stats/materials", methods=["GET"])
def MATERIAL_GET():
    unique_materials = db_session.query(Chip.material).distinct().all()
    return create_compressed_response([material[0] for material in unique_materials])


@app.route("/stats/thicknesses", methods=["GET"])
def THICKNESS_GET():
    unique_thicknesses = db_session.query(Chip.thickness).distinct().all()
    return create_compressed_response(
        [thickness[0] for thickness in unique_thicknesses]
    )


@app.route("/stats/number_of_chips", methods=["GET"])
def NUMBER_OF_CHIPS_GET():
    num_chips = db_session.query(Chip).count()
    return str(num_chips)


@app.route("/stats/number_of_flakes", methods=["GET"])
def NUMBER_OF_FLAKES_GET():
    num_flakes = db_session.query(Flake).count()
    return str(num_flakes)


@app.route("/stats/number_of_scans", methods=["GET"])
def NUMBER_OF_SCANS_GET():
    num_scans = db_session.query(Scan).count()
    return str(num_scans)


@app.route("/stats/uniqueCombinations", methods=["GET"])
def COMBINATIONS_GET():
    unique_combinations = get_unique_material_thickness_combinations_dict(db_session)
    return create_compressed_response(unique_combinations)


@app.route("/stats/scan", methods=["GET"])
def SCAN_GET_STATS():
    try:
        # assert that the request has a scan_id
        assert request.args.get("scan_id") is not None, "scan_id must be provided"
        scan_id = int(request.args.get("scan_id"))
        scan_dict = get_scan_stats(db_session, scan_id)
        return create_compressed_response(scan_dict)
    except ValueError as ve:
        return f"scan_id must be an integer and not '{request.args.get('scan_id')}'"
    except AssertionError as ae:
        return str(ae)
    except AttributeError as ate:
        return str(ate)


@app.route("/download/flake", methods=["GET"])
def FLAKE_DOWNLOAD():
    try:
        flake_id: int = int(request.args.get("flake_id"))
        download_scalebar: bool = bool(request.args.get("scalebar"))

        flake: Flake = db_session.get(Flake, flake_id)
        assert flake is not None, f"Flake with id '{flake_id}' does not exist"

        memory_file = create_memory_file(flake, download_scalebar, IMAGE_DIRECTORY,)
        return send_file(
            memory_file, download_name=f"Flake_{flake_id:.0f}.zip", as_attachment=True,
        )
    except AssertionError as e:
        return str(e)
    except TypeError:
        return "flake_id must be provided"
    except ValueError:
        return f"flake_id must be an integer and not '{request.args.get('flake_id')}'"


if __name__ == "__main__":
    app.run(
        debug=True, host="0.0.0.0", port=4999,
    )

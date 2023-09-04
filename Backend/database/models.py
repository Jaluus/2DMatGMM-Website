from datetime import datetime
from typing import List, Optional

from sqlalchemy import BigInteger, Boolean, Float, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Scan(Base):
    # fmt: off
    __tablename__ = "scan"
    __table_args__ = {"mysql_engine": "InnoDB"}
    _id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    user: Mapped[str] = mapped_column(String(255), nullable=False)
    time: Mapped[float] = mapped_column(BigInteger, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(String(255))
    # fmt: on

    chips: Mapped[List["Chip"]] = relationship(
        "Chip",
        back_populates="scan",
        cascade="all, delete-orphan, delete",
        single_parent=True,
    )

    def to_dict(self):
        model_dict = dict(self.__dict__)
        del model_dict["_sa_instance_state"]
        if "chips" in model_dict:
            del model_dict["chips"]
        model_dict["id"] = model_dict["_id"]
        del model_dict["_id"]
        return model_dict

    def get_full_dict(self):
        full_dict = dict()
        scan_dict = self.to_dict()
        chip_materials = set()
        for chip in self.chips:
            chip_materials.add(chip.material)
        scan_dict["materials"] = list(chip_materials)

        for key in scan_dict:
            full_dict["scan_" + key] = scan_dict[key]

        return full_dict

    def __repr__(self):
        return f"Scan(name={self.name}, user={self.user}, comment={self.comment}, time={datetime.fromtimestamp(self.time)})"


class Chip(Base):
    # fmt: off
    __tablename__ = "chip"
    __table_args__ = {"mysql_engine": "InnoDB"}
    _id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, unique=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scan._id", ondelete="CASCADE"), nullable=False)
    wafer: Mapped[str] = mapped_column(String(255), nullable=False)
    material: Mapped[str] = mapped_column(String(255), nullable=False)
    # fmt: on

    scan: Mapped["Scan"] = relationship("Scan", back_populates="chips")
    flakes: Mapped[List["Flake"]] = relationship(
        "Flake",
        back_populates="chip",
        cascade="all, delete-orphan, delete",
        single_parent=True,
    )

    def to_dict(self):
        model_dict = dict(self.__dict__)
        del model_dict["_sa_instance_state"]
        if "scan" in model_dict:
            del model_dict["scan"]
        if "flakes" in model_dict:
            del model_dict["flakes"]
        model_dict["id"] = model_dict["_id"]
        del model_dict["_id"]
        return model_dict

    def get_full_dict(self):
        full_dict = dict()
        chip_dict = self.to_dict()
        scan_dict = self.scan.to_dict()

        for key in chip_dict:
            if key == "scan_id":
                continue
            full_dict["chip_" + key] = chip_dict[key]
        for key in scan_dict:
            full_dict["scan_" + key] = scan_dict[key]

        return full_dict

    def __repr__(self):
        return f"Chip(id={self._id}, wafer={self.wafer}, material={self.material})"


class Flake(Base):
    # fmt: off
    __tablename__ = "flake"
    __table_args__ = {"mysql_engine": "InnoDB"}
    _id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, unique=True)
    chip_id: Mapped[int] = mapped_column(ForeignKey("chip._id", ondelete="CASCADE"), nullable=False)
    position_x: Mapped[float] = mapped_column(Float, nullable=False)
    position_y: Mapped[float] = mapped_column(Float, nullable=False)
    size: Mapped[float] = mapped_column(Float, nullable=False)
    thickness: Mapped[str] = mapped_column(String(255), nullable=False)
    entropy: Mapped[float] = mapped_column(Float, nullable=False)
    max_sidelength: Mapped[float] = mapped_column(Float, default=-1)
    min_sidelength: Mapped[float] = mapped_column(Float, default=-1)
    false_positive_probability: Mapped[float] = mapped_column(Float, default=0.0)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    path: Mapped[str] = mapped_column(String(255), nullable=False)
    # fmt: on

    chip: Mapped["Chip"] = relationship("Chip", back_populates="flakes")
    images: Mapped[List["Image"]] = relationship(
        "Image",
        back_populates="flake",
        cascade="all, delete-orphan, delete",
        single_parent=True,
    )

    def to_dict(self):
        model_dict = dict(self.__dict__)
        del model_dict["_sa_instance_state"]
        if "chip" in model_dict:
            del model_dict["chip"]
        if "images" in model_dict:
            del model_dict["images"]
        model_dict["id"] = model_dict["_id"]
        del model_dict["_id"]
        return model_dict

    def get_full_dict(self):
        full_dict = dict()
        flake_dict = self.to_dict()
        chip_dict = self.chip.to_dict()
        scan_dict = self.chip.scan.to_dict()

        full_dict["flake_aspect_ratio"] = round(
            flake_dict["max_sidelength"] / flake_dict["min_sidelength"], 1
        )

        for key in flake_dict:
            if key == "chip_id":
                continue
            full_dict["flake_" + key] = flake_dict[key]
        for key in chip_dict:
            if key == "scan_id":
                continue
            full_dict["chip_" + key] = chip_dict[key]
        for key in scan_dict:
            full_dict["scan_" + key] = scan_dict[key]

        return full_dict

    def __repr__(self):
        return f"Flake(id={self._id}, material={self.chip.material}, size (μm²)={self.size}, thickness={self.thickness}, false_positive_probability={self.false_positive_probability:.1%}, used={self.used}, favorite={self.favorite})"


class Image(Base):
    # fmt: off
    __tablename__ = "image"
    __table_args__ = {"mysql_engine": "InnoDB"}
    _id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, unique=True)
    flake_id: Mapped[int] = mapped_column(ForeignKey("flake._id", ondelete="CASCADE"), nullable=False)
    aperture: Mapped[float] = mapped_column(Float, nullable=False)
    light_voltage: Mapped[float] = mapped_column(Float, nullable=False)
    magnification: Mapped[float] = mapped_column(Float, nullable=False)
    white_balance_r: Mapped[int] = mapped_column(Integer, nullable=False)
    white_balance_g: Mapped[int] = mapped_column(Integer, nullable=False)
    white_balance_b: Mapped[int] = mapped_column(Integer, nullable=False)
    gain: Mapped[float] = mapped_column(Float, nullable=False)
    gamma: Mapped[int] = mapped_column(Integer, nullable=False)
    exposure_time: Mapped[float] = mapped_column(Float, nullable=False)
    # fmt: on

    flake: Mapped["Flake"] = relationship("Flake", back_populates="images")

    def to_dict(self):
        model_dict = dict(self.__dict__)
        del model_dict["_sa_instance_state"]
        if "flake" in model_dict:
            del model_dict["flake"]
        model_dict["id"] = model_dict["_id"]
        del model_dict["_id"]
        return model_dict

    def __repr__(self):
        return f"Image(id={self._id}, magnification={self.magnification}, flake_id={self.flake_id})"

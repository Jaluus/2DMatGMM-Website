import json
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from database.models import Base, Chip, Flake, Image, Scan

FILE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(FILE_DIR, "..", "config.json")
CONFIG = json.load(open(CONFIG_FILE))
USERNAME = CONFIG["database_username"]
PASSWORD = CONFIG["database_password"]
DATABASE_ADDRESS = CONFIG["database_address"]
DATABASE_PORT = CONFIG["database_port"]
DATABASE_NAME = CONFIG["database_name"]

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{USERNAME}:{PASSWORD}@{DATABASE_ADDRESS}:{DATABASE_PORT}/{DATABASE_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
db_session = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)


def init_db():
    """
    Creates the Database Tables and registers the models in the Metadata
    """
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()

    Base.metadata.create_all(bind=engine)

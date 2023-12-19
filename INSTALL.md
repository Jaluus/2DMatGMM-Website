# Installation Guide

This document provides instructions for setting up Apache Lounge, MySQL, Python, and NodeJS on your Windows system.

If you have a Linux System you may use Nginx instead of Apache Lounge.

## Requirements

Ensure that your system meets the following requirements:

- Windows 7 or later
- Administrator access

## Apache Lounge Installation (For Image and Website Serving)

1. Download the Apache Lounge version `httpd-2.4.57-win64-VS17.zip` from the [Apache Lounge website](https://www.apachelounge.com/download/).
2. Extract the downloaded zip file.
3. Move the `Apache24` directory to `C:\Apache24`.
4. Open Command Prompt with administrative privileges.
5. Execute the following command to install Apache as a service: `cd C:\Apache24\bin httpd -k install`. When prompted, allow all communications.
6. Open the `httpd.conf` file located at `C:\Apache24\conf\` and append the following configuration to map the paths to your image directory:

```apacheconf

# This is the configuration for the images directory to allow Apache to serve images from the directory
Alias /images "C:/path/to/your/images"
<Directory "C:/path/to/your/images">
    Options Indexes
    Require all granted
</Directory>

# This is the configuration for the build directory to allow Apache to serve the web application from the directory
DocumentRoot "C:/path/to/the/build"
<Directory "C:/path/to/the/build">
    Options Indexes FollowSymLinks
    AllowOverride All

    Options -MultiViews
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.html [QSA,L]

    Require all granted
</Directory>
```

7. Open Windows `Services`, search for `Apache24`, and start the service. Consider setting the service to start automatically.
8. (Optional) Run the `ipconfig` command in Command Prompt to retrieve your Local IP address. This step is important when running the server within an intranet.

## MySQL Installation (For Database Management)

1. Download the `MySQL Installer for Windows` from the [MySQL Downloads page](https://dev.mysql.com/downloads/) and follow the installation instructions.
2. Once the installation is complete, create a new database with your preferred name.
3. Note: Tables and other related elements will be automatically created when the backend is run for the first time.

## Python Installation (For Backend Data Management)

1. If not already installed as part of the [2DMatGMM setup](https://github.com/Jaluus/2DMatGMM), install Python on your system.
2. Navigate to the `Backend` directory.
3. Run the command `pip install -r requirements.txt` in Command Prompt. This will install all necessary Python packages.
4. Edit the `config.json` file to include all required credentials.
5. Run the command `python app.py` in Command Prompt. This will start the backend service and create all necessary tables in your database.

## NodeJS Installation (For Building the Web Application)

1. Download and install NodeJS from the [official NodeJS website](https://nodejs.org/en).
2. Navigate to the `Frontend` directory.
3. If you are setting up for local deployment only, you can skip this step. Otherwise, edit the `.env` file to include your configurations.
4. Run the command `npm install` in Command Prompt to install all necessary npm packages.
5. Run the command `npm run build` in Command Prompt to build the web application. This will create a `build` directory in the `Frontend` directory.
6. This is the directory that will be served by Apache. Ensure that the `httpd.conf` file is configured to serve the `build` directory by correctly setting the path.
7. Dont forget to restart the Apache service after making any changes to the `httpd.conf` file.
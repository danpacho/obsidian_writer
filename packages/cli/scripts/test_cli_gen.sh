#!/bin/bash

# Set the locale to avoid illegal byte sequence errors
export LC_ALL=C

# Get the current working directory
current_dir=$(pwd)

# Generate a random string of length 16
random_string=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 16)

random_config1=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 16)
random_config2=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 16)
random_config3=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 16)

# Construct the full path
install_path="$current_dir/.test_cli_gen/${random_string}"

node dist/index.cjs -h

# Run create command
node dist/index.cjs create "${install_path}" "${random_config1}" "${random_config2}" "${random_config3}" false

# Run install command
node dist/index.cjs install "${install_path}"

# Run plugin generate command
node dist/index.cjs plugin "${install_path}" AwesomePluginBuildContents build:contents
node dist/index.cjs plugin "${install_path}" AwesomePluginBuildTree build:tree
node dist/index.cjs plugin "${install_path}" AwesomePluginWalkTree walk:tree
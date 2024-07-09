#!/bin/bash

# Set the locale to avoid illegal byte sequence errors
export LC_ALL=C

# Get the current working directory
current_dir=$(pwd)

# Generate a random string of length 16
random_root=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 16)

# Construct the full path
bridge_i_root="$current_dir/.test_cli_gen/${random_root}"
obsidian_valut_root="$current_dir/.test_cli_gen/${random_root}/obsidian-vault"
blog_root="$current_dir/.test_cli_gen/${random_root}/blog"

node dist/index.cjs -h

# Run create command
node dist/index.cjs create "${bridge_i_root}" "${obsidian_valut_root}" "${blog_root}" "${blog_root}/static/assets" "${blog_root}/static/md"

# Run install command
# node dist/index.cjs install "${bridge_i_root}"

# Run plugin generate command
# 1. Generate build plugin
node dist/index.cjs plugin:build "${bridge_i_root}" build:contents AwesomePluginBuildContents
node dist/index.cjs plugin:build "${bridge_i_root}" build:tree
node dist/index.cjs plugin:build "${bridge_i_root}" walk:tree

# 2. Generate publish plugin
node dist/index.cjs plugin:publish "${bridge_i_root}" build
node dist/index.cjs plugin:publish "${bridge_i_root}" repository
node dist/index.cjs plugin:publish "${bridge_i_root}" deploy
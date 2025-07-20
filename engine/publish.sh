#!/bin/bash
# This script compiles the simulation engine executable for production use.

dotnet publish -c Release -r linux-x64 --self-contained true /p:PublishSingleFile=true
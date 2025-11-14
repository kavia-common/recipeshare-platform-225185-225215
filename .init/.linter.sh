#!/bin/bash
cd /home/kavia/workspace/code-generation/recipeshare-platform-225185-225215/flavorfolio_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


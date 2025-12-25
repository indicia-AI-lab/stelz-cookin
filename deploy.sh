#!/bin/bash
# Deploy to Shopify
cd "$(dirname "$0")"
git add .
git commit -m "${1:-Update theme}"
git push
shopify theme push --store=indicia-next-level.myshopify.com --theme=190710448463


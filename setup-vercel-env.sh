#!/bin/bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://uahqcswbuyqquanaxgpy.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhaHFjc3didXlxcXVhbmF4Z3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzE1MTUsImV4cCI6MjA5NTkwNzUxNX0.uLVXBHuSHSkQ-oxIiH12zIlb9pICaw5uV_o3mT-zw38"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhaHFjc3didXlxcXVhbmF4Z3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDMzMTUxNSwiZXhwIjoyMDk1OTA3NTE1fQ.gLr10f3wZ45W1Nw7aG51A7z_d33bn_gP9iZtwb_llBg"
vercel env add NEXT_PUBLIC_STORE_URL production <<< "https://maisonoir-web.vercel.app"
echo "✅ Admin env vars set."

#!/bin/bash
# Verify multilingual implementation is complete

echo "✅ Checking if i18n.js has been added to HTML files..."

files=(
  "index.html"
  "patient.html"
  "login.html"
  "register.html"
  "doctor.html"
  "admin.html"
  "doctor-login.html"
  "doctor-register.html"
  "chatbot.html"
  "medicine-finder.html"
  "prescription.html"
  "medical-records.html"
  "ai-chatbot.html"
  "video-room.html"
)

echo ""
for file in "${files[@]}"; do
  if grep -q "js/i18n.js" "$file" 2>/dev/null; then
    echo "✅ $file"
  else
    echo "❌ $file"
  fi
done

echo ""
echo "✅ Checking translation files exist..."

trans_files=(
  "translations/en.json"
  "translations/ta.json"
  "translations/hi.json"
)

for file in "${trans_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file"
  fi
done

echo ""
echo "✅ Checking i18n.js exists..."
if [ -f "js/i18n.js" ]; then
  echo "✅ js/i18n.js"
else
  echo "❌ js/i18n.js"
fi

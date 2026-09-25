import os
from pathlib import Path
import fitz  # PyMuPDF
from app.demo.seed_data import DEMO_DOCUMENTS
from app.config import settings

def generate_demo_files():
    storage_dir = Path(settings.LOCAL_STORAGE_DIR)
    demo_dir = storage_dir / "demo"
    demo_dir.mkdir(parents=True, exist_ok=True)

    for doc in DEMO_DOCUMENTS:
        file_rel = doc["file_path"]
        file_path = storage_dir / file_rel
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        pdf = fitz.open()
        page = pdf.new_page(width=595, height=842)  # A4
        
        # Header banner
        page.draw_rect(fitz.Rect(40, 40, 555, 110), color=(0.1, 0.4, 0.7), fill=(0.95, 0.97, 1.0))
        page.insert_text((55, 75), doc["title"][:50], fontsize=13, color=(0.05, 0.2, 0.5))
        category_str = doc["category"].upper()
        status_str = doc["status"].upper()
        page.insert_text((55, 95), f"Category: {category_str}  |  Status: {status_str}", fontsize=9, color=(0.3, 0.3, 0.3))
        
        y = 135
        page.insert_text((40, y), "Extracted Key Fields:", fontsize=11, color=(0.1, 0.1, 0.1))
        y += 18
        for field_name, field_val, conf in doc["fields"]:
            page.insert_text((50, y), f"{field_name}:", fontsize=9, color=(0.2, 0.2, 0.2))
            # Strip non-latin characters for standard font if needed or keep text
            val_str = str(field_val)
            page.insert_text((180, y), val_str[:60], fontsize=9, color=(0.0, 0.0, 0.0))
            y += 16
        
        y += 15
        page.insert_text((40, y), "Summary:", fontsize=11, color=(0.1, 0.1, 0.1))
        y += 15
        
        rect = fitz.Rect(50, y, 540, y + 60)
        page.insert_textbox(rect, doc["ai_summary"], fontsize=9, color=(0.2, 0.2, 0.2))
        y += 70
        
        page.insert_text((40, y), "Raw Content Excerpt:", fontsize=11, color=(0.1, 0.1, 0.1))
        y += 15
        rect_raw = fitz.Rect(50, y, 540, 780)
        page.insert_textbox(rect_raw, doc["raw_ocr_text"], fontsize=8, color=(0.3, 0.3, 0.3))
        
        pdf.save(str(file_path))
        pdf.close()
        print(f"Generated: {file_rel} ({os.path.getsize(file_path)} bytes)")

    # Also upload to Supabase if configured
    if settings.STORAGE_BACKEND == "supabase" and settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            for doc in DEMO_DOCUMENTS:
                file_rel = doc["file_path"]
                file_path = storage_dir / file_rel
                with open(file_path, "rb") as f:
                    file_bytes = f.read()
                try:
                    supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
                        file_rel,
                        file_bytes,
                        {"content-type": "application/pdf", "upsert": "true"}
                    )
                    print(f"Uploaded to Supabase: {file_rel}")
                except Exception as up_err:
                    print(f"Notice uploading {file_rel}: {up_err}")
        except Exception as sb_err:
            print(f"Notice connecting to Supabase: {sb_err}")

if __name__ == "__main__":
    generate_demo_files()

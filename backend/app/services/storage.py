import os
import shutil
from pathlib import Path
from typing import Tuple, Optional
from fastapi import UploadFile
from app.config import settings

class StorageService:
    def __init__(self):
        self.backend = settings.STORAGE_BACKEND
        self.local_dir = Path(settings.LOCAL_STORAGE_DIR)
        self.local_dir.mkdir(parents=True, exist_ok=True)

    async def save_file(self, file: UploadFile, user_id: str, document_id: str) -> Tuple[str, int]:
        """
        Saves uploaded file to either Supabase Storage or Local Disk.
        Returns: (file_path_identifier, file_size_bytes)
        """
        file_ext = Path(file.filename or "doc").suffix.lower()
        if not file_ext:
            file_ext = ".pdf" if file.content_type == "application/pdf" else ".jpg"

        file_name = f"{document_id}{file_ext}"

        if self.backend == "supabase" and settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                from supabase import create_client
                supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                file_content = await file.read()
                storage_path = f"{user_id}/{file_name}"
                
                # Upload to Supabase bucket
                supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
                    storage_path,
                    file_content,
                    {"content-type": file.content_type or "application/octet-stream"}
                )
                return storage_path, len(file_content)
            except Exception as e:
                # Log and fallback to local
                pass

        # Local storage fallback
        user_folder = self.local_dir / user_id
        user_folder.mkdir(parents=True, exist_ok=True)
        target_path = user_folder / file_name

        file.file.seek(0)
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(target_path)
        # Store relative path
        rel_path = f"{user_id}/{file_name}"
        return rel_path, file_size

    def get_file_bytes(self, file_path: str) -> Optional[bytes]:
        """Retrieves raw file bytes."""
        local_full_path = self.local_dir / file_path
        if local_full_path.exists():
            with open(local_full_path, "rb") as f:
                return f.read()

        if self.backend == "supabase" and settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                from supabase import create_client
                supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                res = supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).download(file_path)
                return res
            except Exception:
                pass
        return None

    def get_preview_url(self, file_path: str, document_id: str) -> str:
        """Returns preview URL for the client."""
        if self.backend == "supabase" and settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                from supabase import create_client
                supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                # Create signed URL valid for 1 hour
                res = supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).create_signed_url(
                    file_path, 3600
                )
                if res and "signedURL" in res:
                    return res["signedURL"]
            except Exception:
                pass

        # Return local preview endpoint
        return f"/api/documents/{document_id}/file"

    def delete_file(self, file_path: str) -> bool:
        """Deletes file from storage."""
        try:
            local_full_path = self.local_dir / file_path
            if local_full_path.exists():
                os.remove(local_full_path)

            if self.backend == "supabase" and settings.SUPABASE_URL and settings.SUPABASE_KEY:
                from supabase import create_client
                supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).remove([file_path])
            return True
        except Exception:
            return False

storage_service = StorageService()

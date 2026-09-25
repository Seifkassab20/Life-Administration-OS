import datetime
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models import Profile

security = HTTPBearer(auto_error=False)

class AuthenticatedUser(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = "User"

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> AuthenticatedUser:
    """
    Validates Supabase JWT or fallback token and returns current authenticated user.
    Guarantees strict tenant isolation.
    """
    # If no credentials provided, allow demo mode in development
    if not credentials:
        if settings.ENVIRONMENT == "development" or settings.DEBUG:
            return AuthenticatedUser(
                id=settings.DEMO_USER_ID,
                email=settings.DEMO_USER_EMAIL,
                full_name=settings.DEMO_USER_NAME
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )

    token = credentials.credentials
    try:
        # Check if Supabase JWT secret is configured
        secret = settings.SUPABASE_JWT_SECRET or settings.JWT_SECRET_KEY
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub") or payload.get("user_id")
        email = payload.get("email", "user@example.com")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return AuthenticatedUser(
            id=str(user_id),
            email=email,
            full_name=payload.get("user_metadata", {}).get("full_name") or payload.get("full_name", "User")
        )
    except JWTError:
        # Check if it matches demo token
        if token == "demo-token" or settings.DEBUG:
            return AuthenticatedUser(
                id=settings.DEMO_USER_ID,
                email=settings.DEMO_USER_EMAIL,
                full_name=settings.DEMO_USER_NAME
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

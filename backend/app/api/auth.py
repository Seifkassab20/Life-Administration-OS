import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt

from app.config import settings
from app.database import get_db
from app.models import Profile
from app.schemas import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, UserProfileResponse, ProfileUpdateRequest
)
from app.api.deps import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/auth", tags=["Authentication"])

def create_access_token(user_id: str, email: str, full_name: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "full_name": full_name,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    secret = settings.SUPABASE_JWT_SECRET or settings.JWT_SECRET_KEY
    return jwt.encode(payload, secret, algorithm="HS256")

@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    """Registers user and creates their isolated profile."""
    # If Supabase is configured, client can also register directly via Supabase Auth
    user_id = str(int(datetime.datetime.utcnow().timestamp() * 1000))
    token = create_access_token(user_id, req.email, req.full_name or "User")

    # Ensure profile exists
    prof = Profile(user_id=user_id, full_name=req.full_name, locale="en")
    db.add(prof)
    await db.commit()

    return TokenResponse(
        access_token=token,
        user_id=user_id,
        email=req.email,
        full_name=req.full_name
    )

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticates user and returns session JWT."""
    # For demo & MVP local dev
    user_id = settings.DEMO_USER_ID if req.email == settings.DEMO_USER_EMAIL else str(hash(req.email) % 10000000)
    full_name = settings.DEMO_USER_NAME if user_id == settings.DEMO_USER_ID else req.email.split("@")[0].capitalize()

    token = create_access_token(user_id, req.email, full_name)
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        email=req.email,
        full_name=full_name
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns current user's profile details."""
    stmt = select(Profile).where(Profile.user_id == current_user.id)
    res = await db.execute(stmt)
    prof = res.scalars().first()

    locale = prof.locale if prof else "en"
    full_name = prof.full_name if (prof and prof.full_name) else current_user.full_name

    return UserProfileResponse(
        user_id=current_user.id,
        email=current_user.email,
        full_name=full_name,
        locale=locale,
        created_at=prof.created_at if prof else datetime.datetime.utcnow()
    )

@router.patch("/profile", response_model=UserProfileResponse)
async def update_profile(
    req: ProfileUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates user locale or name."""
    stmt = select(Profile).where(Profile.user_id == current_user.id)
    res = await db.execute(stmt)
    prof = res.scalars().first()
    if not prof:
        prof = Profile(user_id=current_user.id, full_name=current_user.full_name)
        db.add(prof)

    if req.full_name is not None:
        prof.full_name = req.full_name
    if req.locale is not None:
        prof.locale = req.locale

    await db.commit()
    await db.refresh(prof)

    return UserProfileResponse(
        user_id=current_user.id,
        email=current_user.email,
        full_name=prof.full_name,
        locale=prof.locale,
        created_at=prof.created_at
    )

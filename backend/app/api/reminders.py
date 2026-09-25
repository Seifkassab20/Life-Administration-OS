import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, asc

from app.database import get_db
from app.models import Reminder, Document
from app.schemas import ReminderCreate, ReminderUpdate, ReminderResponse
from app.api.deps import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/reminders", tags=["Reminders"])

@router.get("", response_model=List[ReminderResponse])
async def list_reminders(
    include_dismissed: bool = False,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lists all upcoming reminders for the authenticated user."""
    query = select(Reminder, Document.title.label("document_title")).outerjoin(
        Document, Reminder.document_id == Document.id
    ).where(Reminder.user_id == current_user.id)

    if not include_dismissed:
        query = query.where(Reminder.is_dismissed == False)

    query = query.order_by(asc(Reminder.reminder_date))
    res = await db.execute(query)
    rows = res.all()

    today = datetime.date.today()
    results = []
    for rem, doc_title in rows:
        days_rem = (rem.target_date - today).days
        results.append(ReminderResponse(
            id=rem.id,
            user_id=rem.user_id,
            document_id=rem.document_id,
            document_title=doc_title or "General Reminder",
            title=rem.title,
            description=rem.description,
            reminder_type=rem.reminder_type,
            target_date=rem.target_date,
            days_before=rem.days_before,
            reminder_date=rem.reminder_date,
            days_remaining=days_rem,
            is_sent=rem.is_sent,
            is_dismissed=rem.is_dismissed,
            created_at=rem.created_at
        ))
    return results

@router.post("", response_model=ReminderResponse)
async def create_reminder(
    req: ReminderCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Creates a custom reminder for the authenticated user."""
    rem_date = req.target_date - datetime.timedelta(days=req.days_before)
    rem = Reminder(
        user_id=current_user.id,
        document_id=req.document_id,
        title=req.title,
        description=req.description,
        reminder_type=req.reminder_type,
        target_date=req.target_date,
        days_before=req.days_before,
        reminder_date=rem_date,
        is_sent=False,
        is_dismissed=False
    )
    db.add(rem)
    await db.commit()
    await db.refresh(rem)

    doc_title = None
    if req.document_id:
        doc_stmt = select(Document.title).where(Document.id == req.document_id)
        doc_res = await db.execute(doc_stmt)
        doc_title = doc_res.scalars().first()

    today = datetime.date.today()
    return ReminderResponse(
        id=rem.id,
        user_id=rem.user_id,
        document_id=rem.document_id,
        document_title=doc_title,
        title=rem.title,
        description=rem.description,
        reminder_type=rem.reminder_type,
        target_date=rem.target_date,
        days_before=rem.days_before,
        reminder_date=rem.reminder_date,
        days_remaining=(rem.target_date - today).days,
        is_sent=rem.is_sent,
        is_dismissed=rem.is_dismissed,
        created_at=rem.created_at
    )

@router.patch("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: str,
    req: ReminderUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates reminder or dismisses it."""
    stmt = select(Reminder).where(Reminder.id == reminder_id, Reminder.user_id == current_user.id)
    res = await db.execute(stmt)
    rem = res.scalars().first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")

    if req.title is not None:
        rem.title = req.title
    if req.description is not None:
        rem.description = req.description
    if req.target_date is not None:
        rem.target_date = req.target_date
    if req.days_before is not None:
        rem.days_before = req.days_before
        rem.reminder_date = rem.target_date - datetime.timedelta(days=rem.days_before)
    if req.is_dismissed is not None:
        rem.is_dismissed = req.is_dismissed

    await db.commit()
    await db.refresh(rem)

    today = datetime.date.today()
    return ReminderResponse(
        id=rem.id,
        user_id=rem.user_id,
        document_id=rem.document_id,
        title=rem.title,
        description=rem.description,
        reminder_type=rem.reminder_type,
        target_date=rem.target_date,
        days_before=rem.days_before,
        reminder_date=rem.reminder_date,
        days_remaining=(rem.target_date - today).days,
        is_sent=rem.is_sent,
        is_dismissed=rem.is_dismissed,
        created_at=rem.created_at
    )

@router.delete("/{reminder_id}", status_code=204)
async def delete_reminder(
    reminder_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deletes a reminder."""
    stmt = select(Reminder).where(Reminder.id == reminder_id, Reminder.user_id == current_user.id)
    res = await db.execute(stmt)
    rem = res.scalars().first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")
    await db.delete(rem)
    await db.commit()
    return None

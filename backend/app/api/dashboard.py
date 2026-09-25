import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, asc

from app.database import get_db
from app.models import Document, Reminder, Profile
from app.schemas import (
    DashboardSummaryResponse, ExpiringDocumentItem, DocumentSummary, ReminderResponse
)
from app.api.deps import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def get_time_based_greeting(name: str) -> str:
    now_hour = datetime.datetime.now().hour
    if 5 <= now_hour < 12:
        period = "Good morning"
    elif 12 <= now_hour < 18:
        period = "Good afternoon"
    else:
        period = "Good evening"
    first_name = name.split()[0] if name else "there"
    return f"{period}, {first_name} 👋"

@router.get("", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns dashboard overview metrics, expiring documents list, and upcoming reminders.
    """
    # 1. Fetch user profile for name
    prof_stmt = select(Profile).where(Profile.user_id == current_user.id)
    prof_res = await db.execute(prof_stmt)
    prof = prof_res.scalars().first()
    display_name = prof.full_name if (prof and prof.full_name) else current_user.full_name

    # 2. Fetch all user documents
    doc_stmt = select(Document).where(Document.user_id == current_user.id).order_by(desc(Document.created_at))
    doc_res = await db.execute(doc_stmt)
    all_docs = doc_res.scalars().all()

    total_docs = len(all_docs)
    today = datetime.date.today()
    expiring_soon_items = []
    needs_attention_count = 0

    for doc in all_docs:
        # Check attention status
        if doc.status in ["needs_review", "attention_soon", "expired"]:
            needs_attention_count += 1

        target_date = doc.expiry_date or doc.due_date
        if target_date:
            days_left = (target_date - today).days
            if 0 <= days_left <= 90:
                expiring_soon_items.append(ExpiringDocumentItem(
                    id=doc.id,
                    title=doc.title,
                    document_type=doc.document_type,
                    category=doc.category,
                    expiry_date=target_date,
                    days_left=days_left,
                    status=doc.status
                ))

    # Sort expiring soon by days left ascending
    expiring_soon_items.sort(key=lambda x: x.days_left)

    # 3. Recent documents (first 5)
    recent_docs = [DocumentSummary.from_orm(d) for d in all_docs[:5]]

    # 4. Upcoming Reminders
    rem_stmt = select(Reminder, Document.title.label("doc_title")).outerjoin(
        Document, Reminder.document_id == Document.id
    ).where(
        Reminder.user_id == current_user.id,
        Reminder.is_dismissed == False
    ).order_by(asc(Reminder.reminder_date)).limit(5)
    rem_res = await db.execute(rem_stmt)

    upcoming_reminders = []
    for rem, d_title in rem_res.all():
        upcoming_reminders.append(ReminderResponse(
            id=rem.id,
            user_id=rem.user_id,
            document_id=rem.document_id,
            document_title=d_title or "General Reminder",
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
        ))

    return DashboardSummaryResponse(
        greeting=get_time_based_greeting(display_name),
        total_documents=total_docs,
        expiring_soon_count=len(expiring_soon_items),
        needs_attention_count=needs_attention_count,
        recently_added_count=min(total_docs, 5),
        expiring_documents=expiring_soon_items[:6],
        recent_documents=recent_docs,
        upcoming_reminders=upcoming_reminders
    )

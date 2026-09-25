import json
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Profile, Document, DocumentField, DocumentChunk, Reminder, ProcessingJob
from app.services.embeddings import embedding_service
from app.config import settings

DEMO_DOCUMENTS = [
    {
        "id": "doc-demo-vehicle-license",
        "title": "Vehicle License — Toyota Corolla (رخصة تسيير)",
        "document_type": "vehicle_license",
        "category": "vehicle",
        "file_path": "demo/vehicle_license.pdf",
        "mime_type": "application/pdf",
        "file_size_bytes": 142050,
        "status": "attention_soon",
        "confidence_score": 0.96,
        "user_confirmed": True,
        "issue_date": datetime.date(2025, 4, 15),
        "expiry_date": datetime.date.today() + datetime.timedelta(days=12),  # Expires in 12 days!
        "due_date": None,
        "raw_ocr_text": "جمهورية مصر العربية - وزارة الداخلية - الإدارة العامة للمرور\nرخصة تسيير مركبة ملاكي\nاسم المالك: سيف كساب (Seif Kassab)\nالمركبة: تويوتا كورولا (Toyota Corolla)\nالموديل: 2022\nرقم اللوحات المعدنية: س ي ف 1234 (SYF 1234)\nرقم الشاسيه: NZE141-9238120\nتاريخ التحرير: 2025-04-15\nتاريخ انتهاء الترخيص: " + (datetime.date.today() + datetime.timedelta(days=12)).isoformat(),
        "normalized_text": "جمهورية مصر العربية وزارة الداخلية الادارة العامة للمرور رخصة تسيير مركبة ملاكي اسم المالك سيف كساب المركبة تويوتا كورولا رقم اللوحات س ي ف 1234 الشاسيه NZE141 9238120",
        "ai_summary": "Egyptian vehicle license for Toyota Corolla 2022, license plates س ي ف 1234, registered to Seif Kassab. Expiring in 12 days.",
        "fields": [
            ("Owner", "Seif Kassab (سيف كساب)", 0.98),
            ("Vehicle", "Toyota Corolla 2022", 0.97),
            ("License Number", "س ي ف 1234 (SYF 1234)", 0.99),
            ("Chassis Number", "NZE141-9238120", 0.95),
            ("Motor Number", "2ZR-FE-491203", 0.94),
            ("Traffic Department", "New Cairo Traffic Unit (مرور القاهرة الجديدة)", 0.92),
        ]
    },
    {
        "id": "doc-demo-vehicle-insurance",
        "title": "Comprehensive Motor Insurance (وثيقة تأمين شامل)",
        "document_type": "vehicle_insurance",
        "category": "vehicle",
        "file_path": "demo/vehicle_insurance.pdf",
        "mime_type": "application/pdf",
        "file_size_bytes": 210400,
        "status": "safe",
        "confidence_score": 0.95,
        "user_confirmed": True,
        "issue_date": datetime.date(2025, 11, 18),
        "expiry_date": datetime.date.today() + datetime.timedelta(days=31),  # Expires in 31 days!
        "due_date": None,
        "raw_ocr_text": "شركة مصر للتأمين - وثيقة تأمين السيارات التكميلي الشامل\nرقم الوثيقة: EGY-INS-98214\nالمؤمن له: سيف كساب (Seif Kassab)\nنوع السيارة: تويوتا كورولا 2022\nالقيمة التأمينية: 850,000 جنيه مصري\nتاريخ بدء السريان: 2025-11-18\nتاريخ انتهاء الوثيقة: " + (datetime.date.today() + datetime.timedelta(days=31)).isoformat() + "\nالتغطية: تأمين شامل ضد الحوادث والسرقة والحريق.",
        "normalized_text": "شركة مصر للتامين وثيقة تامين السيارات التكميلي الشامل رقم الوثيقة EGY INS 98214 المؤمن له سيف كساب تويوتا كورولا 2022",
        "ai_summary": "Comprehensive motor insurance policy with Misr Insurance Company covering Toyota Corolla up to 850,000 EGP. Expires in 31 days.",
        "fields": [
            ("Policy Number", "EGY-INS-98214", 0.98),
            ("Insurance Provider", "Misr Insurance Company (شركة مصر للتأمين)", 0.97),
            ("Insured Person", "Seif Kassab (سيف كساب)", 0.98),
            ("Insured Value", "850,000 EGP", 0.95),
            ("Coverage Type", "Comprehensive (شامل - حوادث/سرقة/حريق)", 0.96),
        ]
    },
    {
        "id": "doc-demo-national-id",
        "title": "Egyptian National ID (بطاقة الرقم القومي)",
        "document_type": "national_id",
        "category": "personal",
        "file_path": "demo/national_id.pdf",
        "mime_type": "application/pdf",
        "file_size_bytes": 115200,
        "status": "safe",
        "confidence_score": 0.99,
        "user_confirmed": True,
        "issue_date": datetime.date(2021, 6, 1),
        "expiry_date": datetime.date(2028, 6, 1),
        "due_date": None,
        "raw_ocr_text": "جمهورية مصر العربية - وزارة الداخلية - قطاع مصلحة الأحوال المدنية\nبطاقة تحقيق الشخصية (الرقم القومي)\nالاسم: سيف كساب محمد (Seif Kassab Mohamed)\nالرقم القومي: 30101150102355\nتاريخ الميلاد: 15/01/2001\nمحل الإقامة: 14 شارع دجلة، المعادي، القاهرة\nالوظيفة: مهندس برمجيات\nتاريخ الانتهاء: 2028-06-01",
        "normalized_text": "جمهورية مصر العربية وزارة الداخلية قطاع مصلحة الاحوال المدنية بطاقة تحقيق الشخصية الاسم سيف كساب محمد الرقم القومي 30101150102355 تاريخ الميلاد 15 01 2001 المعادي القاهرة",
        "ai_summary": "Egyptian National ID card for Seif Kassab Mohamed, Cairo governorate. Valid through June 2028.",
        "fields": [
            ("Full Name", "Seif Kassab Mohamed (سيف كساب محمد)", 0.99),
            ("National ID Number", "30101150102355", 0.99),
            ("Date of Birth", "2001-01-15 (15 January 2001)", 0.98),
            ("Governorate", "Cairo (القاهرة - كود 01)", 0.98),
            ("Gender", "Male (ذكر)", 0.99),
            ("Occupation", "Software Engineer (مهندس برمجيات)", 0.95),
        ]
    },
    {
        "id": "doc-demo-rental-contract",
        "title": "Residential Lease Agreement — Maadi (عقد إيجار)",
        "document_type": "rental_contract",
        "category": "home",
        "file_path": "demo/rental_contract.pdf",
        "mime_type": "application/pdf",
        "file_size_bytes": 340100,
        "status": "safe",
        "confidence_score": 0.94,
        "user_confirmed": True,
        "issue_date": datetime.date(2025, 9, 1),
        "expiry_date": datetime.date.today() + datetime.timedelta(days=74),  # Expires in 74 days!
        "due_date": None,
        "raw_ocr_text": "عقد إيجار شقة سكنية خاضع للقانون رقم 4 لسنة 1996\nالمؤجر: السيد / أحمد مصطفى إبراهيم\nالمستأجر: السيد / سيف كساب (Seif Kassab)\nالعين المؤجرة: الشقة رقم 4B، العقار رقم 12، شارع 206، دجلة، المعادي، محافظة القاهرة\nالقيمة الإيجارية الشهرية: 8,500 جنيه مصري تدفع مقدماً في أول كل شهر\nمدة العقد: سنة تبدأ من 2025-09-01 وتنتهي في " + (datetime.date.today() + datetime.timedelta(days=74)).isoformat(),
        "normalized_text": "عقد ايجار شقة سكنية المؤجر احمد مصطفى ابراهيم المستاجر سيف كساب العين المؤجرة شقة 4B المعادي القيمة الايجارية 8500 جنيه",
        "ai_summary": "Residential tenancy lease for Apartment 4B in Degla Maadi, Cairo. Monthly rent is 8,500 EGP. Contract ends in 74 days.",
        "fields": [
            ("Tenant", "Seif Kassab (سيف كساب)", 0.97),
            ("Landlord", "Ahmed Mostafa Ibrahim (أحمد مصطفى إبراهيم)", 0.96),
            ("Property Address", "Apt 4B, 12 St 206, Degla, Maadi, Cairo", 0.95),
            ("Monthly Rent", "8,500 EGP / month", 0.98),
            ("Payment Terms", "Paid monthly in advance on the 1st", 0.91),
        ]
    },
    {
        "id": "doc-demo-utility-bill",
        "title": "Electricity Bill — South Cairo Distribution (فاتورة كهرباء)",
        "document_type": "utility_bill",
        "category": "home",
        "file_path": "demo/electricity_bill.pdf",
        "mime_type": "application/pdf",
        "file_size_bytes": 98400,
        "status": "attention_soon",
        "confidence_score": 0.97,
        "user_confirmed": True,
        "issue_date": datetime.date.today() - datetime.timedelta(days=15),
        "expiry_date": None,
        "due_date": datetime.date.today() + datetime.timedelta(days=5),  # Due in 5 days!
        "raw_ocr_text": "الشركة القابضة لكهرباء مصر - شركة جنوب القاهرة لتوزيع الكهرباء\nفاتورة استهلاك الكهرباء لشهر مارس 2026\nاسم المشترك: سيف كساب (Seif Kassab)\nرقم الحساب / السداد الإلكتروني: EG-ELEC-409128\nالعنوان: شقة 4B، دجلة المعادي\nكمية الاستهلاك: 340 ك.و.س\nالمبلغ المطلوب سداده: 420.50 جنيه مصري\nتاريخ الاستحقاق الأخير: " + (datetime.date.today() + datetime.timedelta(days=5)).isoformat(),
        "normalized_text": "الشركة القابضة لكهرباء مصر شركة جنوب القاهرة لتوزيع الكهرباء فاتورة استهلاك المشترك سيف كساب رقم الحساب EG ELEC 409128 المبلغ المطلوب 420.50 جنيه",
        "ai_summary": "Electricity consumption bill from South Cairo Distribution Co. Total amount due is 420.50 EGP, due in 5 days.",
        "fields": [
            ("Customer", "Seif Kassab (سيف كساب)", 0.98),
            ("Account Number", "EG-ELEC-409128", 0.99),
            ("Amount Due", "420.50 EGP", 0.99),
            ("Provider", "South Cairo Electricity Distribution Co.", 0.96),
            ("Billing Period", "March 2026", 0.94),
        ]
    },
    {
        "id": "doc-demo-certificate",
        "title": "Bachelor of Computer Science Degree (شهادة تخرج جامعة القاهرة)",
        "document_type": "certificate",
        "category": "education",
        "file_path": "demo/graduation_certificate.pdf",
        "mime_type": "application/pdf",
        "file_size_bytes": 182300,
        "status": "safe",
        "confidence_score": 0.98,
        "user_confirmed": True,
        "issue_date": datetime.date(2023, 7, 12),
        "expiry_date": None,
        "due_date": None,
        "raw_ocr_text": "جامعة القاهرة - كلية الحاسبات والذكاء الاصطناعي\nشهادة تخرج وإتمام البكالوريوس\nتشهد الكلية بأن الطالب / سيف كساب محمد\nقد حصل على درجة البكالوريوس في علوم الحاسب\nبتقدير عام: ممتاز مع مرتبة الشرف (GPA: 3.88)\nدورة: مايو 2023\nتحريراً في: 2023-07-12\nرقم الاعتماد: CU-FCI-2023-0842",
        "normalized_text": "جامعة القاهرة كلية الحاسبات والذكاء الاصطناعي شهادة تخرج سيف كساب محمد درجة البكالوريوس في علوم الحاسب تقدير ممتاز مع مرتبة الشرف",
        "ai_summary": "Bachelor of Science in Computer Science with Honors awarded to Seif Kassab Mohamed by Cairo University in July 2023.",
        "fields": [
            ("Recipient Name", "Seif Kassab Mohamed (سيف كساب محمد)", 0.99),
            ("Degree Title", "B.Sc. in Computer Science", 0.98),
            ("Institution", "Cairo University (جامعة القاهرة - كلية الحاسبات)", 0.99),
            ("Distinction", "Excellent with First Class Honors (امتياز مع مرتبة الشرف)", 0.97),
            ("Certificate Number", "CU-FCI-2023-0842", 0.95),
        ]
    },
    {
        "id": "doc-demo-work-contract",
        "title": "Employment Agreement — Senior Software Engineer (عقد عمل)",
        "document_type": "work_contract",
        "category": "work",
        "file_path": "demo/employment_contract.pdf",
        "mime_type": "application/pdf",
        "file_size_bytes": 298000,
        "status": "safe",
        "confidence_score": 0.96,
        "user_confirmed": True,
        "issue_date": datetime.date(2025, 1, 1),
        "expiry_date": datetime.date(2027, 1, 1),
        "due_date": None,
        "raw_ocr_text": "عقد عمل محدد المدة طبقاً لقانون العمل المصري رقم 12 لسنة 2003\nالطرف الأول (صاحب العمل): شركة تيك سوليوشنز مينا (Tech Solutions MENA S.A.E)\nالطرف الثاني (الموظف): السيد / سيف كساب (Seif Kassab)\nالمسمى الوظيفي: كبير مهندسي برمجيات (Senior Software Engineer)\nالراتب الشهري الصافي: 45,000 جنيه مصري (خمسة وأربعون ألف جنيه مصري)\nمدة العقد: سنتان تبدأ من 2025-01-01 قابلة للتجديد بموافقة الطرفين.",
        "normalized_text": "عقد عمل محدد المدة الطرف الاول شركة تيك سوليوشنز مينا الطرف الثاني سيف كساب المسمى الوظيفي كبير مهندسي برمجيات الراتب 45000 جنيه",
        "ai_summary": "Employment contract for Senior Software Engineer at Tech Solutions MENA. Monthly net salary is 45,000 EGP. Two-year duration through January 2027.",
        "fields": [
            ("Employee", "Seif Kassab (سيف كساب)", 0.98),
            ("Employer", "Tech Solutions MENA S.A.E", 0.98),
            ("Job Title", "Senior Software Engineer (كبير مهندسي برمجيات)", 0.98),
            ("Monthly Salary", "45,000 EGP / month", 0.97),
            ("Contract Term", "2 Years (Renewable)", 0.95),
        ]
    }
]

async def seed_demo_data(db: AsyncSession, user_id: str = None):
    """Populates database with realistic synthetic demo documents for testing."""
    target_user_id = user_id or settings.DEMO_USER_ID

    # 1. Ensure Profile
    prof_stmt = select(Profile).where(Profile.user_id == target_user_id)
    prof_res = await db.execute(prof_stmt)
    prof = prof_res.scalars().first()
    if not prof:
        prof = Profile(
            user_id=target_user_id,
            full_name=settings.DEMO_USER_NAME,
            locale="en"
        )
        db.add(prof)
        await db.commit()

    # 2. Check if documents already seeded
    existing_stmt = select(Document).where(Document.user_id == target_user_id)
    existing_res = await db.execute(existing_stmt)
    if existing_res.scalars().first():
        return  # Already seeded

    # 3. Create demo documents, fields, chunks, and reminders
    for item in DEMO_DOCUMENTS:
        doc = Document(
            id=item["id"],
            user_id=target_user_id,
            title=item["title"],
            document_type=item["document_type"],
            category=item["category"],
            file_path=item["file_path"],
            mime_type=item["mime_type"],
            file_size_bytes=item["file_size_bytes"],
            status=item["status"],
            confidence_score=item["confidence_score"],
            raw_ocr_text=item["raw_ocr_text"],
            normalized_text=item["normalized_text"],
            ai_summary=item["ai_summary"],
            user_confirmed=item["user_confirmed"],
            issue_date=item["issue_date"],
            expiry_date=item["expiry_date"],
            due_date=item["due_date"]
        )
        db.add(doc)

        # Fields
        for fname, fval, conf in item["fields"]:
            field = DocumentField(
                document_id=item["id"],
                field_name=fname,
                field_value=fval,
                confidence=conf,
                is_user_edited=False
            )
            db.add(field)

        # Chunks for Grounded RAG
        chunk_text = f"Document: {item['title']}\nType: {item['document_type']}\nSummary: {item['ai_summary']}\nDetails:\n" + "\n".join([f"{f[0]}: {f[1]}" for f in item["fields"]])
        emb = embedding_service.generate_embedding(chunk_text)
        chunk = DocumentChunk(
            document_id=item["id"],
            user_id=target_user_id,
            page_number=1,
            chunk_index=0,
            content=chunk_text,
            embedding_json=json.dumps(emb)
        )
        db.add(chunk)

        # Reminders for dates
        target_dt = item["expiry_date"] or item["due_date"]
        if target_dt:
            rem_type = "expiration" if item["expiry_date"] else "due_date"
            for days_b, lbl in [(30, "30 days before"), (7, "7 days before"), (1, "1 day before")]:
                r_date = target_dt - datetime.timedelta(days=days_b)
                rem = Reminder(
                    user_id=target_user_id,
                    document_id=item["id"],
                    title=f"{item['title']} - {lbl}",
                    description=f"{item['title']} is due/expiring on {target_dt.strftime('%B %d, %Y')}.",
                    reminder_type=rem_type,
                    target_date=target_dt,
                    days_before=days_b,
                    reminder_date=r_date,
                    is_sent=False,
                    is_dismissed=False
                )
                db.add(rem)

    await db.commit()

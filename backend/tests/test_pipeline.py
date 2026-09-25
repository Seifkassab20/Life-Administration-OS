import pytest
import datetime
from app.services.ocr import normalize_arabic_text
from app.services.classifier import classifier
from app.services.extractor import extractor
from app.services.embeddings import embedding_service
from app.services.reminders import compute_document_status, generate_automatic_reminders

def test_arabic_text_normalization():
    # Test Alef variations, Eastern digits, and Taa Marbuta
    input_text = "جمهورية مصر العربية - رخصة تسيير ١٢٣٤٥"
    normalized = normalize_arabic_text(input_text)
    assert "١" not in normalized
    assert "12345" in normalized
    assert "جمهوريه" in normalized or "جمهورية" in normalized

def test_document_classification():
    # Test Vehicle License classification
    vehicle_text = "جمهورية مصر العربية وزارة الداخلية رخصة تسيير مركبة ملاكي الشاسيه NZE141"
    doc_type, category, conf = classifier.classify(vehicle_text, "car_license.pdf")
    assert doc_type == "vehicle_license"
    assert category == "vehicle"
    assert conf >= 0.70

    # Test National ID classification
    nid_text = "جمهورية مصر العربية وزارة الداخلية قطاع مصلحة الأحوال المدنية الرقم القومي 30101150102345"
    doc_type, category, conf = classifier.classify(nid_text, "id_card.jpg")
    assert doc_type == "national_id"
    assert category == "personal"
    assert conf >= 0.80

    # Test Utility Bill classification
    bill_text = "شركة جنوب القاهرة لتوزيع الكهرباء فاتورة استهلاك المشترك المبلغ المطلوب 420 جنيه"
    doc_type, category, conf = classifier.classify(bill_text, "bill.pdf")
    assert doc_type == "utility_bill"
    assert category == "home"

def test_document_extraction():
    # Test Egyptian National ID extraction
    nid_text = "بطاقة تحقيق الشخصية الاسم: سيف كساب محمد\nالرقم القومي: 30101150102355"
    result = extractor.extract("national_id", nid_text)
    fields = {f["field_name"]: f["field_value"] for f in result["fields"]}
    assert "National ID Number" in fields
    assert fields["National ID Number"] == "30101150102355"
    assert "Date of Birth" in fields
    assert "2001-01-15" in fields["Date of Birth"]
    assert "Cairo" in fields["Governorate"]
    assert "Male" in fields["Gender"]

def test_automatic_reminders_and_status():
    today = datetime.date.today()
    exp_date = today + datetime.timedelta(days=15)
    status = compute_document_status(0.95, True, expiry_date=exp_date)
    assert status == "attention_soon"

    reminders = generate_automatic_reminders("user-1", "doc-1", "Vehicle License", exp_date)
    assert len(reminders) == 3
    # Check 30d, 7d, 1d
    days_set = {r["days_before"] for r in reminders}
    assert days_set == {30, 7, 1}

def test_vector_embeddings_and_similarity():
    vec1 = embedding_service.generate_embedding("car insurance policy toyota")
    vec2 = embedding_service.generate_embedding("vehicle comprehensive coverage")
    vec3 = embedding_service.generate_embedding("graduation university computer science certificate")

    assert len(vec1) == 384
    sim_related = embedding_service.cosine_similarity(vec1, vec2)
    sim_unrelated = embedding_service.cosine_similarity(vec1, vec3)
    assert sim_related > sim_unrelated

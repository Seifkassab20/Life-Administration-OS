import re
from typing import Tuple, Dict, Any

# Classification rules: maps patterns in Arabic & English to (document_type, category, weight)
CLASSIFICATION_RULES = {
    "national_id": {
        "category": "personal",
        "patterns": [
            r"بطاق[ةه]\s*تحقيق\s*الشخصي[ةه]",
            r"الرقم\s*القومي",
            r"جمهوري[ةه]\s*مصر\s*العربي[ةه]\s*وزار[ةه]\s*الداخلي[ةه]",
            r"قطاع\s*مصلح[ةه]\s*الاحوال\s*المدني[ةه]",
            r"national\s*id",
            r"arab\s*republic\s*of\s*egypt",
            r"\b[23]\d{13}\b",  # 14-digit national id pattern
        ]
    },
    "vehicle_license": {
        "category": "vehicle",
        "patterns": [
            r"رخص[ةه]\s*تسيير",
            r"رخص[ةه]\s*تسيير\s*مركب[ةه]",
            r"ادار[ةه]\s*المرور",
            r"شاسيه|شاسية",
            r"موتور|محرك",
            r"لوحات\s*معدني[ةه]",
            r"vehicle\s*license",
            r"traffic\s*department",
            r"chassis",
            r"motor\s*vehicle",
        ]
    },
    "vehicle_insurance": {
        "category": "vehicle",
        "patterns": [
            r"وثيق[ةه]\s*تأمين",
            r"وثيق[ةه]\s*تامين",
            r"تامين\s*اجباري|تأمين\s*اجباري",
            r"تامين\s*شامل|تأمين\s*شامل",
            r"شرك[ةه]\s*التأمين|شرك[ةه]\s*التامين",
            r"قسط\s*التأمين|قسط\s*التامين",
            r"motor\s*insurance",
            r"vehicle\s*insurance",
            r"insurance\s*policy",
            r"policy\s*number",
        ]
    },
    "rental_contract": {
        "category": "home",
        "patterns": [
            r"عقد\s*ايجار|عقد\s*إيجار",
            r"المؤجر|المؤجر:",
            r"المستأجر|المستأجر:",
            r"العين\s*المؤجرة|العين\s*المؤجره",
            r"القيمة\s*الايجارية|القيمة\s*الإيجارية",
            r"مدة\s*الايجار|مدة\s*الإيجار",
            r"lease\s*agreement",
            r"rental\s*contract",
            r"tenancy\s*contract",
            r"landlord",
            r"tenant",
            r"monthly\s*rent",
        ]
    },
    "utility_bill": {
        "category": "home",
        "patterns": [
            r"فاتور[ةه]\s*كهرباء",
            r"فاتور[ةه]\s*مياه",
            r"فاتور[ةه]\s*غاز",
            r"استهلاك",
            r"رقم\s*المشترك|رقم\s*الحساب",
            r"الشرك[ةه]\s*القابض[ةه]\s*لكهرباء\s*مصر",
            r"غاز\s*مصر|بتروتريد|تاون\s*جاس",
            r"utility\s*bill",
            r"electricity\s*bill",
            r"water\s*bill",
            r"gas\s*bill",
            r"billing\s*period",
            r"due\s*date",
        ]
    },
    "certificate": {
        "category": "education",
        "patterns": [
            r"شهادة\s*تخرج",
            r"شهادة\s*اتمام",
            r"درجة\s*البكالوريوس|درجة\s*الليسانس",
            r"جامع[ةه]|كلي[ةه]|معهد",
            r"يشهد\s*المعهد|تشهد\s*الكلية|تشهد\s*الجامعة",
            r"تقدير\s*عام",
            r"certificate\s*of\s*completion",
            r"bachelor\s*degree",
            r"university|faculty|institute",
            r"this\s*is\s*to\s*certify\s*that",
            r"graduation\s*certificate",
        ]
    },
    "work_contract": {
        "category": "work",
        "patterns": [
            r"عقد\s*عمل|عقد\s*توظيف",
            r"الطرف\s*الاول|الطرف\s*الأول",
            r"الطرف\s*الثاني|الطرف\s*الثاني",
            r"صاحب\s*العمل",
            r"الموظف|العامل",
            r"الراتب\s*الشهري|الاجر\s*الشهري",
            r"ساعات\s*العمل",
            r"employment\s*contract",
            r"work\s*contract",
            r"job\s*offer",
            r"employer",
            r"employee",
            r"monthly\s*salary",
        ]
    }
}

class DocumentClassifier:
    def classify(self, text: str, filename: str = "") -> Tuple[str, str, float]:
        """
        Classifies document text and filename into:
        (document_type, category, confidence_score)
        """
        combined = f"{filename} {text}".lower()
        scores: Dict[str, float] = {}

        for doc_type, rule in CLASSIFICATION_RULES.items():
            score = 0.0
            for pattern in rule["patterns"]:
                matches = len(re.findall(pattern, combined, re.IGNORECASE))
                if matches > 0:
                    score += 1.0 + (matches - 1) * 0.3
            scores[doc_type] = score

        best_type = "other"
        best_category = "other"
        best_score = 0.0

        for doc_type, score in scores.items():
            if score > best_score:
                best_score = score
                best_type = doc_type
                best_category = CLASSIFICATION_RULES[doc_type]["category"]

        # Calculate normalized confidence
        if best_score == 0.0:
            return "other", "other", 0.50

        # Confidence heuristic
        if best_score >= 3.0:
            confidence = min(0.98, 0.85 + (best_score - 3.0) * 0.03)
        elif best_score >= 1.0:
            confidence = 0.75 + (best_score - 1.0) * 0.05
        else:
            confidence = 0.60

        return best_type, best_category, round(confidence, 2)

classifier = DocumentClassifier()

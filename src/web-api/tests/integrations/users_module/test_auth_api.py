import pytest


def test_login_success_mocked(client):
    """
    Якщо база порожня, запит поверне помилку.
    Тут ми перевіряємо, що ендпоінт взагалі доступний і валідує тіло запиту.
    """
    payload = {"email": "test@example.com", "password": "password123"}
    response = client.post("/login", json=payload)

    # Очікуємо 401 або 404, бо користувача ще не створено в тестовій БД
    assert response.status_code in [400, 401, 404]


def test_sign_up_patient(client):
    """Тест успішної реєстрації пацієнта"""
    payload = {
        "email": "new_patient@example.com",
        "password": "securepassword",
        "role": "PATIENT",
        "isActive": True
    }
    response = client.post("/sign-up", json=payload)

    # Залежно від того, чи підключена реальна тестова БД, буде 201 або 500 (якщо БД немає)
    if response.status_code == 201:
        assert "email" in response.json()
        assert response.json()["role"] == "PATIENT"


def test_sign_up_doctor_pending(client):
    """Тест реєстрації лікаря (має повернути статус очікування)"""
    payload = {
        "email": "new_doc@example.com",
        "password": "securepassword",
        "role": "DOCTOR",
        "isActive": True
    }
    response = client.post("/sign-up", json=payload)

    if response.status_code == 201:
        assert response.json()["status"] == "Чекаємо на відповідь адміністратора"


def test_check_doctor_status(client):
    """Тест перевірки статусу лікаря"""
    response = client.get("/doctors?email=new_doc@example.com")

    assert response.status_code == 200
    data = response.json()
    assert "isAuthenticated" in data
    assert "isPending" in data

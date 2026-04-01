from datetime import datetime, timedelta, timezone
from typing import Any
from jose import JWTError, jwt
from core.config import settings


# 현재 시스템에서는 비밀번호를 해시하지 않고 평문으로 저장·검증합니다.
# (네온 DB vding_users.password 컬럼)
# 기존 bcrypt 의존성을 제거하기 위해 passlib을 사용하지 않습니다.
def verify_password(plain: str, stored: str) -> bool:
    """평문 비밀번호 직접 비교 (레거시 호환용)."""
    return plain == stored


def get_password_hash(password: str) -> str:
    """레거시 호환용: 해싱 대신 그대로 반환."""
    return password


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.JWT_EXPIRE_DAYS)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
    except JWTError:
        return None

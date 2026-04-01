# -*- coding: utf-8 -*-
"""
S3 업로드 유틸리티
사용자별로 폴더를 분리하여 개인정보 보호
"""

import boto3
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import UploadFile

from core.config import settings

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # DEBUG 레벨로 설정

# S3 설정
BUCKET_NAME = "jimin260307-vding"
S3_REGION = "ap-northeast-2"

# S3 클라이언트 (지연 초기화)
_s3_client: Optional[boto3.client] = None


def get_s3_client():
    """S3 클라이언트 생성 (싱글톤)"""
    global _s3_client

    if _s3_client is None:
        access_key = settings.AWS_ACCESS_KEY_ID
        secret_key = settings.AWS_SECRET_ACCESS_KEY
        region = settings.AWS_REGION

        # AWS 자격 증명 확인 (키 값은 절대 로그에 출력하지 않음)
        if not access_key or not secret_key:
            logger.error("[S3 ERROR] AWS 자격 증명이 설정되지 않았습니다.")
        else:
            logger.debug(
                "[S3] AWS 자격 증명이 설정되었습니다 (보안상 키 값은 로그에 출력하지 않음)"
            )
            logger.debug(f"[S3] AWS_REGION: {region}")

        if not access_key or not secret_key:
            logger.error("[S3 ERROR] AWS 자격 증명이 설정되지 않았습니다.")
            raise ValueError(
                "AWS 자격 증명이 설정되지 않았습니다. "
                "AWS_ACCESS_KEY_ID와 AWS_SECRET_ACCESS_KEY를 설정하세요."
            )

        _s3_client = boto3.client(
            "s3",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )
        logger.warning("[S3 DEBUG] S3 클라이언트 초기화 완료")

    return _s3_client


async def upload_to_s3(
    file: UploadFile,
    user_id: str,
    folder: str = "posts",
) -> str:
    """
    파일을 S3에 업로드 (사용자별 폴더 분리)

    Args:
        file: 업로드할 파일
        user_id: 사용자 ID (UUID)
        folder: 저장할 폴더명 (기본값: "posts")

    Returns:
        S3 URL (https://bucket.s3.region.amazonaws.com/path)

    폴더 구조:
        users/{user_id}/{folder}/{timestamp}_{filename}
    """
    logger.warning(
        f"[S3 DEBUG] upload_to_s3 시작 - user_id: {user_id}, folder: {folder}, filename: {file.filename}"
    )
    logger.warning(
        f"[S3 DEBUG] 파일 객체 정보 - filename: {file.filename}, content_type: {file.content_type}, size: {file.size if hasattr(file, 'size') else 'unknown'}"
    )

    try:
        s3 = get_s3_client()
        logger.warning(f"[S3 DEBUG] S3 클라이언트 획득 성공")
    except Exception as e:
        logger.error(
            f"[S3 ERROR] S3 클라이언트 획득 실패: {type(e).__name__} - {str(e)}"
        )
        raise

    # 파일 읽기
    try:
        contents = await file.read()
        logger.warning(f"[S3 DEBUG] 파일 읽기 완료 - 크기: {len(contents)} bytes")
    except Exception as e:
        logger.error(f"[S3 ERROR] 파일 읽기 실패: {type(e).__name__} - {str(e)}")
        raise

    # 파일명 생성 (안전한 파일명)
    timestamp = datetime.now().timestamp()
    original_filename = file.filename or "file"
    safe_filename = Path(original_filename).name.replace(" ", "_").replace("/", "_")

    # S3 키 생성 (사용자별 폴더 분리)
    s3_key = f"users/{user_id}/{folder}/{timestamp}_{safe_filename}"
    logger.warning(f"[S3 DEBUG] S3 키 생성: {s3_key}")

    # Content-Type 결정
    content_type = file.content_type or "application/octet-stream"

    try:
        logger.warning(
            f"[S3 DEBUG] S3 업로드 시작 - Bucket: {BUCKET_NAME}, Key: {s3_key}, ContentType: {content_type}"
        )
        logger.warning(f"[S3 DEBUG] 업로드할 파일 크기: {len(contents)} bytes")

        # S3 업로드
        response = s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=contents,
            ContentType=content_type,
        )

        logger.warning(f"[S3 DEBUG] S3 업로드 성공: {s3_key} (사용자: {user_id})")
        logger.warning(
            f"[S3 DEBUG] S3 응답: ETag={response.get('ETag', 'N/A')}, VersionId={response.get('VersionId', 'N/A')}"
        )

        # S3 URL 반환
        s3_url = f"https://{BUCKET_NAME}.s3.{S3_REGION}.amazonaws.com/{s3_key}"
        logger.warning(f"[S3 DEBUG] 생성된 S3 URL: {s3_url}")
        return s3_url

    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        logger.error(f"[S3 ERROR] S3 업로드 실패: {s3_key}", exc_info=True)
        logger.error(f"[S3 ERROR] 예외 타입: {error_type}, 메시지: {error_msg}")
        logger.error(
            f"[S3 ERROR] 업로드 시도 정보 - Bucket: {BUCKET_NAME}, Key: {s3_key}, 파일 크기: {len(contents)} bytes"
        )

        # 더 상세한 에러 정보 제공
        if "NoCredentialsError" in error_type or "Credentials" in error_msg:
            detailed_error = f"AWS 자격 증명 오류: {error_msg}"
        elif (
            "ClientError" in error_type
            or "403" in error_msg
            or "AccessDenied" in error_msg
        ):
            detailed_error = f"S3 접근 권한 오류: {error_msg}"
        elif "BucketNotFound" in error_type or "NoSuchBucket" in error_msg:
            detailed_error = f"S3 버킷을 찾을 수 없음: {error_msg}"
        else:
            detailed_error = f"S3 업로드 실패 ({error_type}): {error_msg}"

        logger.error(f"[S3 ERROR] 상세 에러: {detailed_error}")
        raise ValueError(detailed_error) from e

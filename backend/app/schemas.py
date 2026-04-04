from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class BaseSchema(BaseModel):
    """Base schema with common Pydantic configuration"""

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)

    @model_validator(mode="before")
    @classmethod
    def reject_null_bytes(cls, data: Any) -> Any:
        """Reject null bytes in string values to prevent database errors."""
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str) and "\x00" in value:
                    raise ValueError(
                        f"Null bytes are not allowed in field '{key}'"
                    )
        return data


class TimestampMixin(BaseModel):
    """Mixin for entities with created_at/updated_at fields"""

    created_at: datetime
    updated_at: datetime


class PaymentOrderCreateRequest(BaseSchema):
    amount_paise: int = Field(default=24900, ge=100, le=5000000)
    currency: str = Field(default="INR", min_length=3, max_length=10)
    course_code: str = Field(default="AI_MASTERY_5DAY", min_length=2, max_length=100)
    customer_name: str | None = Field(default=None, max_length=150)
    customer_email: EmailStr | None = None
    customer_contact: str | None = Field(default=None, max_length=25)


class PaymentOrderCreateResponse(BaseSchema):
    order_id: str
    amount_paise: int
    currency: str
    key_id: str
    course_code: str


class PaymentVerifyRequest(BaseSchema):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentVerifyResponse(BaseSchema):
    verified: bool
    status: str
    message: str


class PaymentTransactionResponse(BaseSchema, TimestampMixin):
    id: int
    course_code: str
    amount_paise: int
    currency: str
    status: str
    razorpay_order_id: str
    razorpay_payment_id: str | None
    customer_name: str | None
    customer_email: str | None
    customer_contact: str | None

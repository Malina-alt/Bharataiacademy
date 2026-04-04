import os
from datetime import datetime, timezone

import razorpay
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PaymentTransaction
from app.schemas import (
    PaymentOrderCreateRequest,
    PaymentOrderCreateResponse,
    PaymentTransactionResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
)

router = APIRouter(prefix="/payments", tags=["payments"])


def _razorpay_client() -> tuple[razorpay.Client, str]:
    key_id = os.environ.get("RAZORPAY_KEY_ID")
    key_secret = os.environ.get("RAZORPAY_KEY_SECRET")

    if not key_id or not key_secret:
        raise HTTPException(
            status_code=500,
            detail="Payment provider is not configured",
        )

    return razorpay.Client(auth=(key_id, key_secret)), key_id


@router.post("/order", response_model=PaymentOrderCreateResponse)
def create_order(payload: PaymentOrderCreateRequest, db: Session = Depends(get_db)):
    client, key_id = _razorpay_client()

    try:
        order = client.order.create(
            {
                "amount": payload.amount_paise,
                "currency": payload.currency,
                "receipt": f"receipt_{int(datetime.now(timezone.utc).timestamp())}",
                "notes": {"course_code": payload.course_code},
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unable to initialize payment") from exc

    transaction = PaymentTransaction(
        course_code=payload.course_code,
        amount_paise=payload.amount_paise,
        currency=payload.currency,
        status="created",
        razorpay_order_id=order["id"],
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        customer_contact=payload.customer_contact,
    )
    db.add(transaction)
    db.commit()

    return PaymentOrderCreateResponse(
        order_id=order["id"],
        amount_paise=payload.amount_paise,
        currency=payload.currency,
        key_id=key_id,
        course_code=payload.course_code,
    )


@router.post("/verify", response_model=PaymentVerifyResponse)
def verify_payment(payload: PaymentVerifyRequest, db: Session = Depends(get_db)):
    client, _ = _razorpay_client()

    transaction = (
        db.query(PaymentTransaction)
        .filter(PaymentTransaction.razorpay_order_id == payload.razorpay_order_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": payload.razorpay_order_id,
                "razorpay_payment_id": payload.razorpay_payment_id,
                "razorpay_signature": payload.razorpay_signature,
            }
        )
    except Exception:
        transaction.status = "verification_failed"
        db.commit()
        raise HTTPException(status_code=400, detail="Payment verification failed")

    transaction.razorpay_payment_id = payload.razorpay_payment_id
    transaction.razorpay_signature = payload.razorpay_signature
    transaction.status = "paid"
    db.commit()

    return PaymentVerifyResponse(
        verified=True,
        status="paid",
        message="Payment verified successfully",
    )


@router.get("/transactions", response_model=list[PaymentTransactionResponse])
def list_transactions(db: Session = Depends(get_db)):
    return db.query(PaymentTransaction).order_by(PaymentTransaction.created_at.desc()).all()

from textwrap import indent
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import json

app = FastAPI()


# Enable CORS for React/Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Product model
class Product(BaseModel):
    id: int
    name: str
    price: float
    image: str


# In-memory product data


def get_connection():
    return psycopg2.connect(
            host="localhost",
            database="product_store",
            user="postgres",
            password="Admin@123"
        )

# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Product API is running"
    }


# GET all products
@app.get("/products")
def get_products():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, price, image
        FROM products
        ORDER BY id
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    products = []
    for row in rows:
        products.append({
            "id": row[0],
            "name": row[1],
            "price": float(row[2]),
            "image": row[3]
        })
    return products


# GET product by ID
@app.get("/products/{product_id}")
def get_product(product_id: int):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM products WHERE id = %s
    """,
    (product_id,)
    )

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    product = []
    for row in rows:
        product.append({
            "id": row[0],
            "name": row[1],
            "price": float(row[2]),
            "image": row[3]
        })
    return product

    for product in products:
        if product["id"] == product_id:
            return product

    raise HTTPException(
        status_code=404,
        detail="Product not found"
    )


# POST - Add product
@app.post("/products")
def add_product(product: Product):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id FROM products WHERE id = %s
        """,
        (product.id,)
    )
    if cursor.fetchone() is not None:
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Product already exists"
        )

    cursor.execute(
        """
        INSERT INTO products (id, name, price, image)
        Values (%s, %s, %s, %s)
        """,
        (product.id, product.name, product.price, product.image)
    )

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Didn't added"
        )

    conn.commit()

    cursor.close()
    conn.close()
    return {
        "message": "Product added successfully",
        "product": product
    }


# PUT - Update product
@app.put("/products/{product_id}")
def update_product(
    product_id: int,
    updated_product: Product
):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE products
        SET name = %s, price = %s, image = %s
        WHERE id = %s
        """,
        (
            updated_product.name,
            updated_product.price,
            updated_product.image,
            product_id
        )
    )

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    conn.commit()

    cursor.close()
    conn.close()
    return {
        "message": "Product updated successfully"
    }

    for index, product in enumerate(products):

        if product["id"] == product_id:

            products[index] = updated_product.model_dump()

            return {
                "message": "Product updated successfully",
                "product": updated_product
            }

    raise HTTPException(
        status_code=404,
        detail="Product not found"
    )


# DELETE - Delete product
@app.delete("/products/{product_id}")
def delete_product(product_id: int):

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        DELETE FROM products WHERE id = %s
        """,
        (product_id,)
    )

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    conn.commit()

    cursor.close()
    conn.close()
    return {
        "message": "Product deleted successfully"
    }

    for index, product in enumerate(products):

        if product["id"] == product_id:

            deleted_product = products.pop(index)

            return {
                "message": "Product deleted successfully",
                "product": deleted_product
            }

    raise HTTPException(
        status_code=404,
        detail="Product not found"
    )

@app.get("/products/find/highest/id")
def find_highest_id():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id FROM products ORDER BY id DESC LIMIT 1
        """
    )
    data = cursor.fetchall()
    highest_id = data[0][0]

    cursor.close()
    conn.close()
    return {
        "highest_id": highest_id
    }
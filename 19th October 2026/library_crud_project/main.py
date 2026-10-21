from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2

app = FastAPI()

class Product(BaseModel):
    id: int
    title: str
    author: str
    category: str
    price: float
    stock: int

# 1. Connect Python to PostgreSQL using psycopg2 .
def get_conn():
    conn = psycopg2.connect(
        host="localhost",
        database="library_store",
        user="postgres",
        password="Admin@123"
    )

    print("Connected to PostgreSQL successfully")

    return conn

# 3. Insert these 4 books from Python:
@app.post("/products")
def insert_product(product: Product):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
            INSERT INTO books
            VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            product.id,
            product.title,
            product.author,
            product.category,
            product.price,
            product.stock
        )
    )

    conn.commit()
    cursor.close()
    conn.close()

    return {
        "message": "Product inserted successfully",
        "product": product
    }

# 4. Read and display all books.
@app.get("/products")
def get_products():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT * FROM books")
    products = cur.fetchall()

    cur.close()
    conn.close()
    return products

# 14. Find the total stock available across all books.
@app.get("/products/all_stocks")
def get_product_by_stock():
    print("helo")
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT SUM(stock) FROM books")

    products = cursor.fetchall()
    print(products)

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    cursor.close()
    conn.close()

    return products

# 5. Display only books from the Technology category.
@app.get("/products/{category}")
def get_product_by_category(category: str):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute(
        """
            SELECT * FROM books
            WHERE category = %s
        """,
        (category,)
    )
    products = cursor.fetchall()

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    cursor.close()
    conn.close()
    return products

# 6. Display books whose price is greater than 600.
@app.get("/products/sort/price greater than/{amount}")
def get_product_by_price(amount: int):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute(
        """
            SELECT * from books
            WHERE price > %s
        """,
        (amount,)
    )
    products = cursor.fetchall()

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    cursor.close()
    conn.close()

    return products

# 7. Update the price of book 202 to 950.
# 8. Update the stock of book 204 to 14.
@app.put("/products/update/{book_id}")
def update_product_by_id(book_id: int, product: Product):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
            UPDATE books
            SET title = %s,
                author = %s,
                category = %s,
                price = %s,
                stock = %s
            WHERE book_id = %s
        """,
        (
            product.title,
            product.author,
            product.category,
            product.price,
            product.stock,
            book_id
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
        "message": "Product updated successfully",
        "product": product
    }

# 10. Delete book 203 .
@app.delete("/products/{book_id}")
def delete_product_by_id(book_id: int):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute(
        """
            DELETE FROM books
            WHERE book_id = %s
        """,
        (book_id,)
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
        "message": f"Book with id: {book_id}, deleted successfully",
    }

# 13. Find the book with the highest price.
@app.get("/products/sort/highest price")
def get_product_by_highest_price():
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute(
        """
            SELECT * FROM books
            ORDER BY price
            LIMIT 1
        """
    )
    products = cursor.fetchall()

    cursor.close()
    conn.close()

    return {
        "message": "Book highest price found",
        "products": products
    }


# 15. Count how many books exist in each category.
@app.get("/products/total/category")
def get_total_count_by_each_category():
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute(
        """
            SELECT category, COUNT(book_id) FROM books
            GROUP BY category
        """
    )

    products = cursor.fetchall()
    cursor.close()
    conn.close()

    return products


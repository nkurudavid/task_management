import bcrypt
from app.database import SessionLocal
from app.models import User, UserRole

db = SessionLocal()

# Create lecturer
password = "lecturer123"
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)

lecturer = User(
    email="lecturer@gmail.com",
    username="lecturer",
    hashed_password=hashed.decode('utf-8'),
    full_name="John Lecturer",
    role=UserRole.LECTURER,
    is_active=True
)

db.add(lecturer)
db.commit()

print("✓ Lecturer user created!")
print(f"  - Username: lecturer")
print(f"  - Password: lecturer123")

db.close()
"""
PostgreSQL Configuration Test Script
Run this to verify your PostgreSQL connection is working correctly.
"""


import os
import sys
from pathlib import Path


# Add the project root to the path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))


# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coverfolio_backend.settings')
import django
django.setup()


from django.db import connection
from django.core.management import call_command
from django.conf import settings


def test_database_connection():
   """Test PostgreSQL database connection"""
   print("=" * 60)
   print("PostgreSQL Connection Test")
   print("=" * 60)
   print()
  
   # Print database settings (without password)
   print("📊 Database Configuration:")
   print(f"   Engine: {settings.DATABASES['default']['ENGINE']}")
   print(f"   Database: {settings.DATABASES['default']['NAME']}")
   print(f"   User: {settings.DATABASES['default']['USER']}")
   print(f"   Host: {settings.DATABASES['default']['HOST']}")
   print(f"   Port: {settings.DATABASES['default']['PORT']}")
   print()
  
   # Test connection
   try:
       with connection.cursor() as cursor:
           cursor.execute("SELECT version();")
           version = cursor.fetchone()[0]
           print("✅ Database Connection: SUCCESS")
           print(f"   PostgreSQL Version: {version.split(',')[0]}")
           print()
   except Exception as e:
       print("❌ Database Connection: FAILED")
       print(f"   Error: {str(e)}")
       print()
       print("Troubleshooting tips:")
       print("1. Ensure PostgreSQL is running:")
       print("   brew services list | grep postgresql")
       print()
       print("2. Verify your .env file exists and has correct credentials")
       print()
       print("3. Check if database exists:")
       print("   psql -l | grep coverfolio")
       print()
       return False
  
   # Test migrations
   print("📋 Checking migrations...")
   try:
       from django.db.migrations.executor import MigrationExecutor
       executor = MigrationExecutor(connection)
       plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
      
       if plan:
           print(f"⚠️  {len(plan)} pending migration(s)")
           print("   Run: python manage.py migrate")
       else:
           print("✅ All migrations applied")
       print()
   except Exception as e:
       print(f"⚠️  Could not check migrations: {str(e)}")
       print()
  
   # Test storage configuration
   print("💾 Storage Configuration:")
   if settings.USE_S3:
       print("   Mode: S3-Compatible Object Storage")
       print(f"   Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
       print(f"   Endpoint: {settings.AWS_S3_ENDPOINT_URL}")
       print()
       print("⚠️  Note: Make sure to test file uploads to verify storage!")
   else:
       print("   Mode: Local File Storage")
       print(f"   Media Root: {settings.MEDIA_ROOT}")
       print()
  
   print("=" * 60)
   print("✅ Configuration Test Complete!")
   print("=" * 60)
   print()
   print("Ready to start: python manage.py runserver")
   print()
  
   return True


if __name__ == "__main__":
   test_database_connection()
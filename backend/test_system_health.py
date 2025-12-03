from django.test import TestCase
from django.db import connection
from django.conf import settings
from django.db.migrations.executor import MigrationExecutor
from openai import api_key
import google.generativeai as genai
import os

class SystemHealthTests(TestCase):
    """
    Sanity checks for system configuration.
    These run automatically via 'python manage.py test' 
    (and consequently via your custom manage.py hook).
    """

    def test_database_connection(self):
        """
        Verify that the database is reachable and can execute queries.
        """
        db_name = settings.DATABASES['default']['NAME']
        
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                result = cursor.fetchone()[0]
                
            self.assertEqual(result, 1, "Database query failed to return expected value.")
            
            # Optional: Print to console if you still want visual output during tests
            # Note: Django creates a test_ database, so we check against that.
            print(f"\n✅ Connection successful to test database (Clone of {db_name})")
            
        except Exception as e:
            self.fail(f"❌ Database connection failed: {str(e)}")

    def test_pending_migrations(self):
        """
        Verify there are no pending migrations.
        """
        try:
            executor = MigrationExecutor(connection)
            # Get plan for unapplied migrations
            plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
            
            self.assertFalse(
                plan, 
                f"❌ There are {len(plan)} pending migration(s). Run 'python manage.py migrate'."
            )
            print("\n✅ Migration check passed")
            
        except Exception as e:
            self.fail(f"Could not check migrations: {str(e)}")
    def test_gemini_connection(self):
        """
        Verify Gemini API key is valid and service is reachable.
        """
        # 1. Check if Key Exists in Settings
        api_key = os.getenv('GEMINI_API_KEY')
        self.assertTrue(api_key, "❌ GEMINI_API_KEY is missing from settings")

        # 2. Test Actual Connection
        try:
            genai.configure(api_key=api_key)
            # Use 'gemini-1.5-flash' for the fastest/cheapest health check
            model = genai.GenerativeModel('gemini-2.5-flash-lite') 
            
            # Send a minimal token to save cost/time
            response = model.generate_content("Hello")
            
            self.assertTrue(response.text, "❌ Gemini API returned empty response")
            print(f"\n✅ Gemini API Connection: SUCCESS")
            
        except Exception as e:
            self.fail(f"❌ Gemini API Error: {str(e)}")

    # def test_storage_configuration(self):
    #     """
    #     Verify storage settings are valid based on environment.
    #     """
    #     use_s3 = getattr(settings, 'USE_S3', False)
        
    #     if use_s3:
    #         bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
    #         endpoint = getattr(settings, 'AWS_S3_ENDPOINT_URL', None)
            
    #         self.assertTrue(bucket, "❌ S3 Mode enabled but AWS_STORAGE_BUCKET_NAME is missing")
    #         self.assertTrue(endpoint, "❌ S3 Mode enabled but AWS_S3_ENDPOINT_URL is missing")
    #         print(f"\n✅ Storage Config: S3 ({bucket})")
    #     else:
    #         media_root = getattr(settings, 'MEDIA_ROOT', None)
    #         self.assertTrue(media_root, "❌ Local Mode enabled but MEDIA_ROOT is missing")
    #         print(f"\n✅ Storage Config: Local ({media_root})")
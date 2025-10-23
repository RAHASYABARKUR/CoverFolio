from rest_framework import serializers
from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    """Serializer for Resume model."""
    
    class Meta:
        model = Resume
        fields = ('id', 'title', 'file_path', 'extracted_text', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

from rest_framework import serializers
from .models import CoverLetter


class CoverLetterSerializer(serializers.ModelSerializer):
    """Serializer for CoverLetter model."""
    
    class Meta:
        model = CoverLetter
        fields = [
            'id', 'title', 'role', 'company_name', 'job_description',
            'additional_info', 'generated_content', 'is_finalized',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate cover letter data."""
        if not data.get('role') or not data.get('job_description'):
            raise serializers.ValidationError({
                'role': 'Role is required.',
                'job_description': 'Job description is required.'
            })
        
        return data

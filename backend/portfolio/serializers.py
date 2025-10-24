from rest_framework import serializers
from .models import Portfolio, Project, Skill, Experience, Education, Certification


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model."""
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'tech_stack', 'project_url',
            'github_url', 'demo_url', 'image', 'status', 'start_date',
            'end_date', 'featured', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate project dates."""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'End date cannot be before start date.'
            })
        
        return data


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for Skill model."""
    
    class Meta:
        model = Skill
        fields = [
            'id', 'name', 'category', 'proficiency_level',
            'years_of_experience', 'order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ExperienceSerializer(serializers.ModelSerializer):
    """Serializer for Experience model."""
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Experience
        fields = [
            'id', 'company', 'position', 'employment_type', 'location',
            'start_date', 'end_date', 'is_current', 'description',
            'technologies', 'company_url', 'order', 'duration',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duration']
    
    def get_duration(self, obj):
        """Calculate duration of employment."""
        if obj.start_date:
            from datetime import date
            end = obj.end_date or date.today()
            delta = end - obj.start_date
            years = delta.days // 365
            months = (delta.days % 365) // 30
            
            if years > 0 and months > 0:
                return f"{years} year{'s' if years > 1 else ''}, {months} month{'s' if months > 1 else ''}"
            elif years > 0:
                return f"{years} year{'s' if years > 1 else ''}"
            else:
                return f"{months} month{'s' if months > 1 else ''}"
        return None
    
    def validate(self, data):
        """Validate experience dates."""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_current = data.get('is_current', False)
        
        if start_date and end_date and not is_current and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'End date cannot be before start date.'
            })
        
        if is_current and end_date:
            raise serializers.ValidationError({
                'end_date': 'Current positions should not have an end date.'
            })
        
        return data


class EducationSerializer(serializers.ModelSerializer):
    """Serializer for Education model."""
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Education
        fields = [
            'id', 'institution', 'degree', 'field_of_study', 'location',
            'start_date', 'end_date', 'is_current', 'grade', 'description',
            'institution_url', 'order', 'duration', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duration']
    
    def get_duration(self, obj):
        """Calculate duration of education."""
        if obj.start_date:
            from datetime import date
            end = obj.end_date or date.today()
            delta = end - obj.start_date
            years = delta.days // 365
            
            if years > 0:
                return f"{years} year{'s' if years > 1 else ''}"
            return "Less than 1 year"
        return None
    
    def validate(self, data):
        """Validate education dates."""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_current = data.get('is_current', False)
        
        if start_date and end_date and not is_current and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'End date cannot be before start date.'
            })
        
        if is_current and end_date:
            raise serializers.ValidationError({
                'end_date': 'Currently enrolled should not have an end date.'
            })
        
        return data


class CertificationSerializer(serializers.ModelSerializer):
    """Serializer for Certification model."""
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = Certification
        fields = [
            'id', 'name', 'issuing_organization', 'issue_date',
            'expiry_date', 'credential_id', 'credential_url',
            'description', 'order', 'is_expired', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_expired']
    
    def get_is_expired(self, obj):
        """Check if certification is expired."""
        if obj.expiry_date:
            from datetime import date
            return date.today() > obj.expiry_date
        return False
    
    def validate(self, data):
        """Validate certification dates."""
        issue_date = data.get('issue_date')
        expiry_date = data.get('expiry_date')
        
        if issue_date and expiry_date and expiry_date < issue_date:
            raise serializers.ValidationError({
                'expiry_date': 'Expiry date cannot be before issue date.'
            })
        
        return data


class PortfolioSerializer(serializers.ModelSerializer):
    """Main Portfolio serializer with nested relationships."""
    projects = ProjectSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'user', 'user_email', 'user_name', 'title', 'bio',
            'profile_image', 'location', 'website', 'github', 'linkedin',
            'twitter', 'is_public', 'projects', 'skills', 'experiences',
            'education', 'certifications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        """Get user's full name."""
        return obj.user.get_full_name()


class PortfolioBasicSerializer(serializers.ModelSerializer):
    """Lightweight portfolio serializer without nested data."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    project_count = serializers.SerializerMethodField()
    skill_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'user_email', 'user_name', 'title', 'bio',
            'profile_image', 'location', 'website', 'github', 'linkedin',
            'twitter', 'is_public', 'project_count', 'skill_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        """Get user's full name."""
        return obj.user.get_full_name()
    
    def get_project_count(self, obj):
        """Get count of projects."""
        return obj.projects.count()
    
    def get_skill_count(self, obj):
        """Get count of skills."""
        return obj.skills.count()

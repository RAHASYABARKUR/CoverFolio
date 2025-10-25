from rest_framework import serializers
from .models import Portfolio, Project, Skill, Experience, Education, Certification, Hobby, Award, Contact, Publication, Patent, Other


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model."""
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'tech_stack', 'project_url',
            'github_url', 'demo_url', 'image', 'status', 'start_date',
            'end_date', 'featured', 'order', 'duration', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'duration', 'created_at', 'updated_at']
    
    def get_duration(self, obj):
        """Calculate duration of project."""
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


class HobbySerializer(serializers.ModelSerializer):
    """Serializer for Hobby model."""
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Hobby
        fields = [
            'id', 'name', 'description', 'category', 'start_date',
            'end_date', 'is_current', 'achievements', 'order',
            'duration', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duration']
    
    def get_duration(self, obj):
        """Calculate duration of activity."""
        if obj.start_date:
            from datetime import date
            end = obj.end_date or date.today()
            delta = end - obj.start_date
            years = delta.days // 365
            months = (delta.days % 365) // 30
            
            if years > 0:
                return f"{years} year{'s' if years > 1 else ''}" + (f", {months} month{'s' if months > 1 else ''}" if months > 0 else "")
            elif months > 0:
                return f"{months} month{'s' if months > 1 else ''}"
            else:
                return "Less than a month"
        return None
    
    def validate(self, data):
        """Validate hobby dates."""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_current = data.get('is_current', False)
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'End date cannot be before start date.'
            })
        
        if is_current and end_date:
            raise serializers.ValidationError({
                'end_date': 'Current activities should not have an end date.'
            })
        
        return data


class AwardSerializer(serializers.ModelSerializer):
    """Serializer for Award model."""
    
    class Meta:
        model = Award
        fields = [
            'id', 'title', 'issuer', 'date', 'category',
            'description', 'url', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate award date."""
        award_date = data.get('date')
        
        if award_date:
            from datetime import date
            if award_date > date.today():
                raise serializers.ValidationError({
                    'date': 'Award date cannot be in the future.'
                })
        
        return data


class ContactSerializer(serializers.ModelSerializer):
    """Serializer for Contact model."""
    
    class Meta:
        model = Contact
        fields = [
            'id', 'contact_type', 'label', 'value', 'is_primary',
            'is_public', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_value(self, value):
        """Validate contact value based on type."""
        contact_type = self.initial_data.get('contact_type')
        
        # Basic email validation
        if contact_type == 'email':
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, value):
                raise serializers.ValidationError('Invalid email address format.')
        
        # Basic phone validation (allow international formats)
        elif contact_type == 'phone':
            import re
            # Remove common separators for validation
            clean_phone = re.sub(r'[\s\-\(\)\+\.]', '', value)
            if not clean_phone.isdigit() or len(clean_phone) < 10:
                raise serializers.ValidationError('Invalid phone number format.')
        
        # URL validation for web-based contact types
        elif contact_type in ['website', 'linkedin', 'github', 'twitter', 'instagram', 
                              'facebook', 'youtube', 'portfolio', 'blog']:
            if not value.startswith(('http://', 'https://')):
                raise serializers.ValidationError('URL must start with http:// or https://')
        
        return value


class PortfolioSerializer(serializers.ModelSerializer):
    """Main Portfolio serializer with nested relationships."""
    projects = ProjectSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    hobbies = HobbySerializer(many=True, read_only=True)
    awards = AwardSerializer(many=True, read_only=True)
    contacts = ContactSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    projects_count = serializers.SerializerMethodField()
    skills_count = serializers.SerializerMethodField()
    experiences_count = serializers.SerializerMethodField()
    education_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'user', 'user_email', 'user_name', 'title', 'bio',
            'profile_image', 'location', 'website', 'github', 'linkedin',
            'twitter', 'is_public', 'projects', 'skills', 'experiences',
            'education', 'certifications', 'hobbies', 'awards', 'contacts',
            'projects_count', 'skills_count', 'experiences_count', 'education_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        """Get user's full name."""
        return obj.user.get_full_name()
    
    def get_projects_count(self, obj):
        """Get count of projects."""
        return obj.projects.count()
    
    def get_skills_count(self, obj):
        """Get count of skills."""
        return obj.skills.count()
    
    def get_experiences_count(self, obj):
        """Get count of experiences."""
        return obj.experiences.count()
    
    def get_education_count(self, obj):
        """Get count of education entries."""
        return obj.education.count()


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


class PublicationSerializer(serializers.ModelSerializer):
    """Serializer for Publication model."""
    
    class Meta:
        model = Publication
        fields = [
            'id', 'title', 'authors', 'publication_type', 'publisher',
            'publication_date', 'doi', 'url', 'description', 'citation_count',
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate publication data."""
        # Ensure publication_date is not in the future
        from datetime import date
        if data.get('publication_date') and data['publication_date'] > date.today():
            raise serializers.ValidationError({
                'publication_date': 'Publication date cannot be in the future.'
            })
        return data


class PatentSerializer(serializers.ModelSerializer):
    """Serializer for Patent model."""
    
    class Meta:
        model = Patent
        fields = [
            'id', 'title', 'inventors', 'patent_number', 'status',
            'filing_date', 'issue_date', 'patent_office', 'url',
            'description', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate patent data."""
        from datetime import date
        
        # Ensure filing_date is not in the future
        if data.get('filing_date') and data['filing_date'] > date.today():
            raise serializers.ValidationError({
                'filing_date': 'Filing date cannot be in the future.'
            })
        
        # If issue_date is provided, it should be after filing_date
        if data.get('issue_date') and data.get('filing_date'):
            if data['issue_date'] < data['filing_date']:
                raise serializers.ValidationError({
                    'issue_date': 'Issue date must be after filing date.'
                })
        
        return data


class OtherSerializer(serializers.ModelSerializer):
    """Serializer for miscellaneous portfolio items."""
    
    class Meta:
        model = Other
        fields = [
            'id', 'title', 'category', 'description', 'date', 'url',
            'tags', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate other item data."""
        from datetime import date
        
        # Ensure date is not in the future if provided
        if data.get('date') and data['date'] > date.today():
            raise serializers.ValidationError({
                'date': 'Date cannot be in the future.'
            })
        
        return data


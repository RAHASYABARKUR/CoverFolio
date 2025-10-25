from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator, URLValidator

User = get_user_model()


class Portfolio(models.Model):
    """Main portfolio model - one per user."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='portfolio')
    title = models.CharField(max_length=200, help_text="Portfolio title/tagline")
    bio = models.TextField(blank=True, help_text="Short bio or introduction")
    profile_image = models.ImageField(upload_to='portfolio/profiles/', blank=True, null=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True, validators=[URLValidator()])
    github = models.URLField(blank=True, validators=[URLValidator()])
    linkedin = models.URLField(blank=True, validators=[URLValidator()])
    twitter = models.URLField(blank=True, validators=[URLValidator()])
    is_public = models.BooleanField(default=False, help_text="Make portfolio publicly visible")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email}'s Portfolio - {self.title}"


class Project(models.Model):
    """Portfolio projects."""
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('in_progress', 'In Progress'),
        ('planned', 'Planned'),
    ]
    
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    description = models.TextField()
    tech_stack = models.JSONField(default=list, help_text="List of technologies used")
    project_url = models.URLField(blank=True, validators=[URLValidator()])
    github_url = models.URLField(blank=True, validators=[URLValidator()])
    demo_url = models.URLField(blank=True, validators=[URLValidator()])
    image = models.ImageField(upload_to='portfolio/projects/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    featured = models.BooleanField(default=False, help_text="Feature this project")
    order = models.IntegerField(default=0, help_text="Display order")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-featured', 'order', '-created_at']
    
    def __str__(self):
        return f"{self.portfolio.user.email} - {self.title}"


class Skill(models.Model):
    """Skills in portfolio."""
    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    CATEGORY_CHOICES = [
        ('programming', 'Programming Languages'),
        ('framework', 'Frameworks & Libraries'),
        ('database', 'Databases'),
        ('tool', 'Tools & Platforms'),
        ('design', 'Design'),
        ('soft', 'Soft Skills'),
        ('other', 'Other'),
    ]
    
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    proficiency_level = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='intermediate')
    years_of_experience = models.DecimalField(
        max_digits=4, 
        decimal_places=1, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'order', 'name']
        unique_together = ['portfolio', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_proficiency_level_display()})"


class Experience(models.Model):
    """Work experience entries."""
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('freelance', 'Freelance'),
    ]
    
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='full_time')
    location = models.CharField(max_length=100, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True, help_text="Leave blank if current position")
    is_current = models.BooleanField(default=False)
    description = models.TextField(help_text="Job responsibilities and achievements")
    technologies = models.JSONField(default=list, blank=True)
    company_url = models.URLField(blank=True, validators=[URLValidator()])
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_current', '-start_date', 'order']
        verbose_name_plural = 'Experiences'
    
    def __str__(self):
        return f"{self.position} at {self.company}"
    
    def save(self, *args, **kwargs):
        # If marked as current, clear end_date
        if self.is_current:
            self.end_date = None
        super().save(*args, **kwargs)


class Education(models.Model):
    """Education history."""
    DEGREE_CHOICES = [
        ('high_school', 'High School'),
        ('associate', 'Associate Degree'),
        ('bachelor', 'Bachelor\'s Degree'),
        ('master', 'Master\'s Degree'),
        ('phd', 'Ph.D.'),
        ('certificate', 'Certificate'),
        ('bootcamp', 'Bootcamp'),
        ('other', 'Other'),
    ]
    
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='education')
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=20, choices=DEGREE_CHOICES)
    field_of_study = models.CharField(max_length=200)
    location = models.CharField(max_length=100, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True, help_text="Leave blank if currently enrolled")
    is_current = models.BooleanField(default=False)
    grade = models.CharField(max_length=50, blank=True, help_text="GPA or grade")
    description = models.TextField(blank=True, help_text="Achievements, courses, activities")
    institution_url = models.URLField(blank=True, validators=[URLValidator()])
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_current', '-start_date', 'order']
        verbose_name_plural = 'Education'
    
    def __str__(self):
        return f"{self.degree} in {self.field_of_study} from {self.institution}"
    
    def save(self, *args, **kwargs):
        # If marked as current, clear end_date
        if self.is_current:
            self.end_date = None
        super().save(*args, **kwargs)


class Certification(models.Model):
    """Professional certifications."""
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True, help_text="Leave blank if no expiry")
    credential_id = models.CharField(max_length=200, blank=True)
    credential_url = models.URLField(blank=True, validators=[URLValidator()])
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-issue_date', 'order']
    
    def __str__(self):
        return f"{self.name} from {self.issuing_organization}"


class Hobby(models.Model):
    """Hobbies and extracurricular activities."""
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='hobbies')
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=[
            ('sports', 'Sports'),
            ('arts', 'Arts & Music'),
            ('volunteer', 'Volunteering'),
            ('club', 'Clubs & Organizations'),
            ('creative', 'Creative Pursuits'),
            ('other', 'Other'),
        ],
        default='other'
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    achievements = models.TextField(blank=True, help_text="Notable achievements or roles")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_current', '-start_date', 'order']
        verbose_name_plural = 'Hobbies'
    
    def __str__(self):
        return self.name


class Award(models.Model):
    """Accomplishments and awards."""
    CATEGORY_CHOICES = [
        ('academic', 'Academic Achievement'),
        ('professional', 'Professional Recognition'),
        ('competition', 'Competition/Contest'),
        ('scholarship', 'Scholarship'),
        ('leadership', 'Leadership'),
        ('community', 'Community Service'),
        ('publication', 'Publication'),
        ('patent', 'Patent'),
        ('other', 'Other'),
    ]
    
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='awards')
    title = models.CharField(max_length=200, help_text="Award or accomplishment title")
    issuer = models.CharField(max_length=200, help_text="Issuing organization or institution")
    date = models.DateField(help_text="Date received")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(blank=True, help_text="Details about the award or accomplishment")
    url = models.URLField(blank=True, validators=[URLValidator()], help_text="Link to certificate or announcement")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', 'order']
    
    def __str__(self):
        return f"{self.title} from {self.issuer}"


class Contact(models.Model):
    """Contact information and social links."""
    CONTACT_TYPE_CHOICES = [
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('website', 'Website'),
        ('linkedin', 'LinkedIn'),
        ('github', 'GitHub'),
        ('twitter', 'Twitter/X'),
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('youtube', 'YouTube'),
        ('portfolio', 'Portfolio'),
        ('blog', 'Blog'),
        ('other', 'Other'),
    ]
    
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='contacts')
    contact_type = models.CharField(max_length=20, choices=CONTACT_TYPE_CHOICES)
    label = models.CharField(max_length=100, help_text="Display label (e.g., 'Work Email', 'Personal Phone')")
    value = models.CharField(max_length=255, help_text="Email address, phone number, or URL")
    is_primary = models.BooleanField(default=False, help_text="Mark as primary contact method")
    is_public = models.BooleanField(default=True, help_text="Show on public portfolio")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_primary', 'order', 'contact_type']
    
    def __str__(self):
        return f"{self.label} ({self.get_contact_type_display()})"


class Publication(models.Model):
    """Academic publications, research papers, articles."""
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='publications')
    title = models.CharField(max_length=300)
    authors = models.TextField(help_text="Comma-separated list of authors")
    publication_type = models.CharField(
        max_length=50,
        choices=[
            ('journal', 'Journal Article'),
            ('conference', 'Conference Paper'),
            ('book', 'Book'),
            ('chapter', 'Book Chapter'),
            ('thesis', 'Thesis/Dissertation'),
            ('preprint', 'Preprint'),
            ('magazine', 'Magazine Article'),
            ('blog', 'Blog Post'),
            ('other', 'Other'),
        ],
        default='journal'
    )
    publisher = models.CharField(max_length=200, blank=True, help_text="Journal/Conference/Publisher name")
    publication_date = models.DateField()
    doi = models.CharField(max_length=100, blank=True, help_text="Digital Object Identifier")
    url = models.URLField(blank=True, help_text="Link to the publication")
    description = models.TextField(blank=True, help_text="Abstract or summary")
    citation_count = models.IntegerField(default=0, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-publication_date', 'order']
    
    def __str__(self):
        return self.title


class Patent(models.Model):
    """Patents and intellectual property."""
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='patents')
    title = models.CharField(max_length=300)
    inventors = models.TextField(help_text="Comma-separated list of inventors")
    patent_number = models.CharField(max_length=100, blank=True, help_text="Patent/Application number")
    status = models.CharField(
        max_length=50,
        choices=[
            ('granted', 'Granted'),
            ('pending', 'Pending'),
            ('filed', 'Filed'),
            ('published', 'Published'),
            ('expired', 'Expired'),
        ],
        default='filed'
    )
    filing_date = models.DateField()
    issue_date = models.DateField(null=True, blank=True, help_text="Date patent was granted")
    patent_office = models.CharField(max_length=100, blank=True, help_text="e.g., USPTO, EPO, etc.")
    url = models.URLField(blank=True, help_text="Link to patent details")
    description = models.TextField(blank=True, help_text="Patent abstract or summary")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-filing_date', 'order']
    
    def __str__(self):
        return f"{self.title} ({self.patent_number or 'No number'})"


class Other(models.Model):
    """Model for miscellaneous portfolio items that don't fit other categories"""
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='others')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, help_text="Custom category name (e.g., 'Volunteer Work', 'Press', 'Media')")
    description = models.TextField(blank=True)
    date = models.DateField(null=True, blank=True, help_text="Relevant date for this item")
    url = models.URLField(blank=True, help_text="Related link")
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    order = models.IntegerField(default=0, help_text="Display order")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-date', '-created_at']
        verbose_name = 'Other Item'
        verbose_name_plural = 'Other Items'

    def __str__(self):
        return f"{self.title}" + (f" ({self.category})" if self.category else "")


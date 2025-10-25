from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from .models import Portfolio, Project, Skill, Experience, Education, Certification, Hobby, Award, Contact, Publication, Patent, Other
from .serializers import (
    PortfolioSerializer,
    PortfolioBasicSerializer,
    ProjectSerializer,
    SkillSerializer,
    ExperienceSerializer,
    EducationSerializer,
    CertificationSerializer,
    HobbySerializer,
    AwardSerializer,
    ContactSerializer,
    PublicationSerializer,
    PatentSerializer,
    OtherSerializer
)
from resume_parser.models import Resume


# ==================== Portfolio Views ====================

@api_view(['GET', 'POST', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def portfolio_view(request):
    """
    Get, create, or update portfolio for authenticated user.
    
    GET /api/portfolio/ - Get user's portfolio
    POST /api/portfolio/ - Create portfolio (if doesn't exist)
    PUT/PATCH /api/portfolio/ - Update portfolio
    """
    if request.method == 'GET':
        try:
            portfolio = Portfolio.objects.get(user=request.user)
            serializer = PortfolioSerializer(portfolio)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Portfolio.DoesNotExist:
            return Response({
                'message': 'Portfolio not created yet',
                'exists': False
            }, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'POST':
        # Check if portfolio already exists
        if Portfolio.objects.filter(user=request.user).exists():
            return Response({
                'error': 'Portfolio already exists. Use PUT/PATCH to update.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = PortfolioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({
                'message': 'Portfolio created successfully',
                'portfolio': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method in ['PUT', 'PATCH']:
        try:
            portfolio = Portfolio.objects.get(user=request.user)
        except Portfolio.DoesNotExist:
            return Response({
                'error': 'Portfolio not found. Create one first.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        partial = request.method == 'PATCH'
        serializer = PortfolioSerializer(portfolio, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Portfolio updated successfully',
                'portfolio': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_portfolio_view(request, user_id):
    """
    Get public portfolio by user ID.
    
    GET /api/portfolio/public/{user_id}/
    """
    try:
        portfolio = Portfolio.objects.get(user_id=user_id, is_public=True)
        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Public portfolio not found'
        }, status=status.HTTP_404_NOT_FOUND)


# ==================== Project Views ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def project_list_create(request):
    """
    List all projects or create a new project.
    
    GET /api/portfolio/projects/ - List all user's projects
    POST /api/portfolio/projects/ - Create new project
    """
    try:
        portfolio = Portfolio.objects.get(user=request.user)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found. Create a portfolio first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        projects = Project.objects.filter(portfolio=portfolio)
        serializer = ProjectSerializer(projects, many=True)
        return Response({
            'projects': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response({
                'message': 'Project created successfully',
                'project': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def project_detail(request, project_id):
    """
    Get, update, or delete a specific project.
    
    GET /api/portfolio/projects/{id}/ - Get project details
    PUT/PATCH /api/portfolio/projects/{id}/ - Update project
    DELETE /api/portfolio/projects/{id}/ - Delete project
    """
    try:
        portfolio = Portfolio.objects.get(user=request.user)
        project = Project.objects.get(id=project_id, portfolio=portfolio)
    except Portfolio.DoesNotExist:
        return Response({'error': 'Portfolio not found'}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ProjectSerializer(project, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Project updated successfully',
                'project': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        project.delete()
        return Response({
            'message': 'Project deleted successfully'
        }, status=status.HTTP_200_OK)


# ==================== Skill Views ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def skill_list_create(request):
    """
    List all skills or create a new skill.
    
    GET /api/portfolio/skills/ - List all user's skills
    POST /api/portfolio/skills/ - Create new skill
    """
    try:
        portfolio = Portfolio.objects.get(user=request.user)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found. Create a portfolio first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        skills = Skill.objects.filter(portfolio=portfolio)
        serializer = SkillSerializer(skills, many=True)
        return Response({
            'skills': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(portfolio=portfolio)
                return Response({
                    'message': 'Skill added successfully',
                    'skill': serializer.data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'error': 'Skill already exists in your portfolio'
                }, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def skill_detail(request, skill_id):
    """
    Get, update, or delete a specific skill.
    
    GET /api/portfolio/skills/{id}/ - Get skill details
    PUT/PATCH /api/portfolio/skills/{id}/ - Update skill
    DELETE /api/portfolio/skills/{id}/ - Delete skill
    """
    try:
        portfolio = Portfolio.objects.get(user=request.user)
        skill = Skill.objects.get(id=skill_id, portfolio=portfolio)
    except Portfolio.DoesNotExist:
        return Response({'error': 'Portfolio not found'}, status=status.HTTP_404_NOT_FOUND)
    except Skill.DoesNotExist:
        return Response({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = SkillSerializer(skill)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = SkillSerializer(skill, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Skill updated successfully',
                'skill': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        skill.delete()
        return Response({
            'message': 'Skill deleted successfully'
        }, status=status.HTTP_200_OK)


# ==================== Experience Views ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def experience_list_create(request):
    """
    List all experiences or create a new experience.
    
    GET /api/portfolio/experiences/ - List all user's experiences
    POST /api/portfolio/experiences/ - Create new experience
    """
    try:
        portfolio = Portfolio.objects.get(user=request.user)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found. Create a portfolio first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        experiences = Experience.objects.filter(portfolio=portfolio)
        serializer = ExperienceSerializer(experiences, many=True)
        return Response({
            'experiences': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = ExperienceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response({
                'message': 'Experience added successfully',
                'experience': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def experience_detail(request, experience_id):
    """
    Get, update, or delete a specific experience.
    """
    try:
        portfolio = Portfolio.objects.get(user=request.user)
        experience = Experience.objects.get(id=experience_id, portfolio=portfolio)
    except Portfolio.DoesNotExist:
        return Response({'error': 'Portfolio not found'}, status=status.HTTP_404_NOT_FOUND)
    except Experience.DoesNotExist:
        return Response({'error': 'Experience not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ExperienceSerializer(experience)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ExperienceSerializer(experience, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Experience updated successfully',
                'experience': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        experience.delete()
        return Response({
            'message': 'Experience deleted successfully'
        }, status=status.HTTP_200_OK)


# ==================== Education Views ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def education_list_create(request):
    """List all education entries or create a new one."""
    try:
        portfolio = Portfolio.objects.get(user=request.user)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found. Create a portfolio first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        education = Education.objects.filter(portfolio=portfolio)
        serializer = EducationSerializer(education, many=True)
        return Response({
            'education': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = EducationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response({
                'message': 'Education added successfully',
                'education': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def education_detail(request, education_id):
    """Get, update, or delete a specific education entry."""
    try:
        portfolio = Portfolio.objects.get(user=request.user)
        education = Education.objects.get(id=education_id, portfolio=portfolio)
    except Portfolio.DoesNotExist:
        return Response({'error': 'Portfolio not found'}, status=status.HTTP_404_NOT_FOUND)
    except Education.DoesNotExist:
        return Response({'error': 'Education not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = EducationSerializer(education)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = EducationSerializer(education, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Education updated successfully',
                'education': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        education.delete()
        return Response({
            'message': 'Education deleted successfully'
        }, status=status.HTTP_200_OK)


# ==================== Certification Views ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def certification_list_create(request):
    """List all certifications or create a new one."""
    try:
        portfolio = Portfolio.objects.get(user=request.user)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found. Create a portfolio first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        certifications = Certification.objects.filter(portfolio=portfolio)
        serializer = CertificationSerializer(certifications, many=True)
        return Response({
            'certifications': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = CertificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response({
                'message': 'Certification added successfully',
                'certification': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def certification_detail(request, certification_id):
    """Get, update, or delete a specific certification."""
    try:
        portfolio = Portfolio.objects.get(user=request.user)
        certification = Certification.objects.get(id=certification_id, portfolio=portfolio)
    except Portfolio.DoesNotExist:
        return Response({'error': 'Portfolio not found'}, status=status.HTTP_404_NOT_FOUND)
    except Certification.DoesNotExist:
        return Response({'error': 'Certification not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CertificationSerializer(certification)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = CertificationSerializer(certification, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Certification updated successfully',
                'certification': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        certification.delete()
        return Response({
            'message': 'Certification deleted successfully'
        }, status=status.HTTP_200_OK)


# ==================== Hobby Views ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def hobby_list_create(request):
    """List all hobbies or create a new hobby."""
    portfolio = get_object_or_404(Portfolio, user=request.user)
    
    if request.method == 'GET':
        hobbies = Hobby.objects.filter(portfolio=portfolio)
        serializer = HobbySerializer(hobbies, many=True)
        return Response({
            'hobbies': serializer.data,
            'count': hobbies.count()
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = HobbySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response({
                'message': 'Hobby created successfully',
                'hobby': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def hobby_detail(request, hobby_id):
    """Retrieve, update, or delete a hobby."""
    portfolio = get_object_or_404(Portfolio, user=request.user)
    
    try:
        hobby = Hobby.objects.get(id=hobby_id, portfolio=portfolio)
    except Hobby.DoesNotExist:
        return Response({'error': 'Hobby not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = HobbySerializer(hobby)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = HobbySerializer(hobby, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Hobby updated successfully',
                'hobby': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        hobby.delete()
        return Response({
            'message': 'Hobby deleted successfully'
        }, status=status.HTTP_200_OK)


# ==================== Award Views ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def award_list_create(request):
    """List all awards or create a new award."""
    portfolio = get_object_or_404(Portfolio, user=request.user)
    
    if request.method == 'GET':
        awards = Award.objects.filter(portfolio=portfolio)
        serializer = AwardSerializer(awards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = AwardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response({
                'message': 'Award created successfully',
                'award': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def award_detail(request, award_id):
    """Retrieve, update, or delete an award."""
    portfolio = get_object_or_404(Portfolio, user=request.user)
    
    try:
        award = Award.objects.get(id=award_id, portfolio=portfolio)
    except Award.DoesNotExist:
        return Response({'error': 'Award not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = AwardSerializer(award)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = AwardSerializer(award, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Award updated successfully',
                'award': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        award.delete()
        return Response({
            'message': 'Award deleted successfully'
        }, status=status.HTTP_200_OK)


# ==================== Contact Views ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def contact_list_create(request):
    """List all contacts or create a new contact."""
    portfolio = get_object_or_404(Portfolio, user=request.user)
    
    if request.method == 'GET':
        contacts = Contact.objects.filter(portfolio=portfolio)
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = ContactSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response({
                'message': 'Contact created successfully',
                'contact': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def contact_detail(request, contact_id):
    """Retrieve, update, or delete a contact."""
    portfolio = get_object_or_404(Portfolio, user=request.user)
    
    try:
        contact = Contact.objects.get(id=contact_id, portfolio=portfolio)
    except Contact.DoesNotExist:
        return Response({'error': 'Contact not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ContactSerializer(contact)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ContactSerializer(contact, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Contact updated successfully',
                'contact': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        contact.delete()
        return Response({
            'message': 'Contact deleted successfully'
        }, status=status.HTTP_200_OK)


# ==================== Auto-Populate from Resume ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def populate_from_resume(request, resume_id):
    """
    Auto-populate portfolio from resume structured data.
    
    POST /api/portfolio/populate-from-resume/<resume_id>/
    Body: {
        "overwrite": false  # Optional: whether to overwrite existing data
    }
    """
    # Get the resume
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response({
            'error': 'Resume not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if resume has structured data
    if not resume.structured_data:
        return Response({
            'error': 'Resume has not been parsed yet. Please re-upload the resume.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = resume.structured_data
    overwrite = request.data.get('overwrite', False)
    
    # Get or create portfolio
    portfolio, created = Portfolio.objects.get_or_create(
        user=request.user,
        defaults={
            'title': data.get('name', 'My Portfolio'),
            'github': data.get('github', ''),
            'linkedin': data.get('linkedin', '')
        }
    )
    
    # Update portfolio if data exists and overwrite is True
    if not created and overwrite:
        portfolio.github = data.get('github', portfolio.github)
        portfolio.linkedin = data.get('linkedin', portfolio.linkedin)
        portfolio.save()
    
    stats = {
        'created': {'education': 0, 'experience': 0, 'projects': 0, 'skills': 0, 'hobbies': 0},
        'skipped': {'education': 0, 'experience': 0, 'projects': 0, 'skills': 0, 'hobbies': 0}
    }
    
    # Populate Education
    for edu_data in data.get('education', []):
        if not edu_data.get('degree'):
            continue
            
        # Check if already exists (by degree and institution)
        exists = Education.objects.filter(
            portfolio=portfolio,
            degree__icontains=edu_data.get('degree', '')[:50],
            institution__icontains=edu_data.get('institution', '')[:50]
        ).exists()
        
        if exists and not overwrite:
            stats['skipped']['education'] += 1
            continue
        
        if exists and overwrite:
            Education.objects.filter(
                portfolio=portfolio,
                degree__icontains=edu_data.get('degree', '')[:50],
                institution__icontains=edu_data.get('institution', '')[:50]
            ).delete()
        
        # Parse year to date
        year_str = edu_data.get('year', '')
        end_date = None
        start_date = None
        if year_str:
            try:
                from datetime import date
                year = int(''.join(filter(str.isdigit, year_str))[:4])
                if year > 0:
                    end_date = date(year, 12, 31)
                    start_date = date(max(year - 4, 2000), 9, 1)  # Assume 4-year degree
            except:
                pass
        
        # If no date parsed, use defaults
        if not start_date:
            from datetime import date
            start_date = date(2020, 9, 1)
        
        # Map degree text to choices
        degree_text = edu_data.get('degree', '').lower()
        degree_choice = 'other'
        if 'bachelor' in degree_text or 'b.s' in degree_text or 'b.a' in degree_text:
            degree_choice = 'bachelor'
        elif 'master' in degree_text or 'm.s' in degree_text or 'm.a' in degree_text:
            degree_choice = 'master'
        elif 'phd' in degree_text or 'ph.d' in degree_text or 'doctor' in degree_text:
            degree_choice = 'phd'
        elif 'associate' in degree_text:
            degree_choice = 'associate'
        elif 'high school' in degree_text:
            degree_choice = 'high_school'
        
        try:
            Education.objects.create(
                portfolio=portfolio,
                degree=degree_choice,
                institution=edu_data.get('institution', 'Unknown Institution')[:200],
                field_of_study=edu_data.get('degree', 'Not Specified')[:200],
                start_date=start_date,
                end_date=end_date,
                grade=edu_data.get('gpa', '')[:50] if edu_data.get('gpa') else ''
            )
            stats['created']['education'] += 1
        except Exception as e:
            print(f"Failed to create education entry: {e}")
            stats['skipped']['education'] += 1
    
    # Populate Experience
    for exp_data in data.get('experience', []):
        if not exp_data.get('company') or not exp_data.get('role'):
            continue
            
        exists = Experience.objects.filter(
            portfolio=portfolio,
            company__icontains=exp_data.get('company', '')[:50],
            position__icontains=exp_data.get('role', '')[:50]
        ).exists()
        
        if exists and not overwrite:
            stats['skipped']['experience'] += 1
            continue
        
        if exists and overwrite:
            Experience.objects.filter(
                portfolio=portfolio,
                company__icontains=exp_data.get('company', '')[:50],
                position__icontains=exp_data.get('role', '')[:50]
            ).delete()
        
        # Parse years
        from datetime import date
        years_str = exp_data.get('years', '')
        start_date = date(2020, 1, 1)  # Default
        end_date = None
        is_current = 'present' in years_str.lower() if years_str else False
        
        # Try to parse year from years string
        if years_str:
            import re
            years = re.findall(r'(19|20)\d{2}', years_str)
            if len(years) >= 1:
                try:
                    start_year = int(years[0])
                    start_date = date(start_year, 1, 1)
                    if len(years) >= 2 and not is_current:
                        end_year = int(years[1])
                        end_date = date(end_year, 12, 31)
                except:
                    pass
        
        try:
            Experience.objects.create(
                portfolio=portfolio,
                company=exp_data.get('company', '')[:200],
                position=exp_data.get('role', '')[:200],
                description=exp_data.get('role_summary', ''),
                start_date=start_date,
                end_date=end_date,
                is_current=is_current
            )
            stats['created']['experience'] += 1
        except Exception as e:
            print(f"Failed to create experience entry: {e}")
            stats['skipped']['experience'] += 1
    
    # Populate Projects
    for proj_data in data.get('projects', []):
        if not proj_data.get('title'):
            continue
            
        exists = Project.objects.filter(
            portfolio=portfolio,
            title__icontains=proj_data.get('title', '')[:50]
        ).exists()
        
        if exists and not overwrite:
            stats['skipped']['projects'] += 1
            continue
        
        if exists and overwrite:
            Project.objects.filter(
                portfolio=portfolio,
                title__icontains=proj_data.get('title', '')[:50]
            ).delete()
        
        Project.objects.create(
            portfolio=portfolio,
            title=proj_data.get('title', '')[:200],
            description=proj_data.get('description', ''),
            tech_stack=proj_data.get('technologies', [])
        )
        stats['created']['projects'] += 1
    
    # Populate Skills
    for skill_name in data.get('skills', []):
        if not skill_name or len(skill_name) < 2:
            continue
            
        exists = Skill.objects.filter(
            portfolio=portfolio,
            name__iexact=skill_name[:100]
        ).exists()
        
        if exists:
            stats['skipped']['skills'] += 1
            continue
        
        Skill.objects.create(
            portfolio=portfolio,
            name=skill_name[:100]
        )
        stats['created']['skills'] += 1
    
    # Populate Hobbies/Extracurriculars
    for hobby_text in data.get('extracurriculars', []):
        if not hobby_text or len(hobby_text) < 5:
            continue
            
        # Extract name (first part before any punctuation or newline)
        name = hobby_text.split('.')[0].split('\n')[0][:200]
        
        exists = Hobby.objects.filter(
            portfolio=portfolio,
            name__icontains=name[:50]
        ).exists()
        
        if exists and not overwrite:
            stats['skipped']['hobbies'] += 1
            continue
        
        if exists and overwrite:
            Hobby.objects.filter(
                portfolio=portfolio,
                name__icontains=name[:50]
            ).delete()
        
        Hobby.objects.create(
            portfolio=portfolio,
            name=name,
            description=hobby_text
        )
        stats['created']['hobbies'] += 1
    
    return Response({
        'message': 'Portfolio populated successfully from resume',
        'portfolio_id': portfolio.id,
        'statistics': stats
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def publication_list_create(request):
    """List all publications or create a new one."""
    try:
        portfolio = Portfolio.objects.get(user=request.user)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found. Create a portfolio first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        publications = Publication.objects.filter(portfolio=portfolio)
        serializer = PublicationSerializer(publications, many=True)
        return Response({
            'publications': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = PublicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response({
                'message': 'Publication added successfully',
                'publication': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def publication_detail(request, pk):
    """Retrieve, update, or delete a publication."""
    try:
        portfolio = Portfolio.objects.get(user=request.user)
        publication = Publication.objects.get(pk=pk, portfolio=portfolio)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Publication.DoesNotExist:
        return Response({
            'error': 'Publication not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = PublicationSerializer(publication)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = PublicationSerializer(
            publication,
            data=request.data,
            partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Publication updated successfully',
                'publication': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        publication.delete()
        return Response({
            'message': 'Publication deleted successfully'
        }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def patent_list_create(request):
    """List all patents or create a new one."""
    try:
        portfolio = Portfolio.objects.get(user=request.user)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found. Create a portfolio first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        patents = Patent.objects.filter(portfolio=portfolio)
        serializer = PatentSerializer(patents, many=True)
        return Response({
            'patents': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = PatentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response({
                'message': 'Patent added successfully',
                'patent': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def patent_detail(request, pk):
    """Retrieve, update, or delete a patent."""
    try:
        portfolio = Portfolio.objects.get(user=request.user)
        patent = Patent.objects.get(pk=pk, portfolio=portfolio)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Patent.DoesNotExist:
        return Response({
            'error': 'Patent not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = PatentSerializer(patent)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = PatentSerializer(
            patent,
            data=request.data,
            partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Patent updated successfully',
                'patent': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        patent.delete()
        return Response({
            'message': 'Patent deleted successfully'
        }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def other_list_create(request):
    """List all other items or create a new one."""
    try:
        portfolio = Portfolio.objects.get(user=request.user)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        others = Other.objects.filter(portfolio=portfolio)
        serializer = OtherSerializer(others, many=True)
        return Response({
            'others': serializer.data,
            'count': others.count()
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = OtherSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(portfolio=portfolio)
            return Response({
                'message': 'Other item created successfully',
                'other': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def other_detail(request, pk):
    """Retrieve, update or delete an other item."""
    try:
        portfolio = Portfolio.objects.get(user=request.user)
        other = Other.objects.get(pk=pk, portfolio=portfolio)
    except Portfolio.DoesNotExist:
        return Response({
            'error': 'Portfolio not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Other.DoesNotExist:
        return Response({
            'error': 'Other item not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = OtherSerializer(other)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = OtherSerializer(
            other,
            data=request.data,
            partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Other item updated successfully',
                'other': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        other.delete()
        return Response({
            'message': 'Other item deleted successfully'
        }, status=status.HTTP_200_OK)


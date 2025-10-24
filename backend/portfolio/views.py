from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from .models import Portfolio, Project, Skill, Experience, Education, Certification
from .serializers import (
    PortfolioSerializer,
    PortfolioBasicSerializer,
    ProjectSerializer,
    SkillSerializer,
    ExperienceSerializer,
    EducationSerializer,
    CertificationSerializer
)


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

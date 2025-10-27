from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import CoverLetter
from .serializers import CoverLetterSerializer
from .generator import generate_cover_letter_for_user


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_cover_letter(request):
    """
    Generate a new cover letter using AI and portfolio data.
    
    POST /api/cover-letters/generate/
    Body: {
        "role": "Software Engineer",
        "company_name": "Google",
        "job_description": "Job description text...",
        "additional_info": "Additional information...",
        "title": "Cover Letter for Google Software Engineer"
    }
    """
    # Validate required fields
    required_fields = ['role', 'job_description']
    for field in required_fields:
        if not request.data.get(field):
            return Response({
                'error': f'{field} is required'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Generate cover letter content
        generated_content = generate_cover_letter_for_user(
            user=request.user,
            role=request.data['role'],
            company_name=request.data.get('company_name', ''),
            job_description=request.data['job_description'],
            additional_info=request.data.get('additional_info', '')
        )
        
        # Create cover letter record
        cover_letter_data = {
            'title': request.data.get('title', f"Cover Letter for {request.data['role']}"),
            'role': request.data['role'],
            'company_name': request.data.get('company_name', ''),
            'job_description': request.data['job_description'],
            'additional_info': request.data.get('additional_info', ''),
            'generated_content': generated_content
        }
        
        serializer = CoverLetterSerializer(data=cover_letter_data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({
                'message': 'Cover letter generated successfully',
                'cover_letter': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Failed to generate cover letter: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_cover_letters(request):
    """
    List all cover letters for the authenticated user.
    
    GET /api/cover-letters/
    """
    cover_letters = CoverLetter.objects.filter(user=request.user)
    serializer = CoverLetterSerializer(cover_letters, many=True)
    return Response({
        'cover_letters': serializer.data,
        'count': len(serializer.data)
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def cover_letter_detail(request, cover_letter_id):
    """
    Get, update, or delete a specific cover letter.
    
    GET /api/cover-letters/{id}/ - Get cover letter details
    PUT/PATCH /api/cover-letters/{id}/ - Update cover letter
    DELETE /api/cover-letters/{id}/ - Delete cover letter
    """
    try:
        cover_letter = CoverLetter.objects.get(id=cover_letter_id, user=request.user)
    except CoverLetter.DoesNotExist:
        return Response({'error': 'Cover letter not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CoverLetterSerializer(cover_letter)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = CoverLetterSerializer(cover_letter, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Cover letter updated successfully',
                'cover_letter': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        cover_letter.delete()
        return Response({
            'message': 'Cover letter deleted successfully'
        }, status=status.HTTP_200_OK)
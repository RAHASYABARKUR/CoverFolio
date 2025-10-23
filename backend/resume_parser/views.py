import pdfplumber
import os
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Resume
from .serializers import ResumeSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    """
    Upload and parse a resume PDF file.
    
    POST /api/resume/upload/
    Body: FormData with 'file' field containing PDF file
    """
    if 'file' not in request.FILES:
        return Response({
            'error': 'No file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['file']
    
    # Validate file type
    if not file.name.lower().endswith('.pdf'):
        return Response({
            'error': 'Only PDF files are allowed'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Save file to media directory
        file_path = f"resumes/{request.user.id}/{file.name}"
        saved_path = default_storage.save(file_path, ContentFile(file.read()))
        
        # Extract text from PDF
        extracted_text = ""
        try:
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
        except Exception as e:
            return Response({
                'error': f'Failed to extract text from PDF: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create resume record
        resume = Resume.objects.create(
            user=request.user,
            title=file.name.replace('.pdf', ''),
            file_path=saved_path,
            extracted_text=extracted_text.strip()
        )
        
        serializer = ResumeSerializer(resume)
        return Response({
            'message': 'Resume uploaded and parsed successfully',
            'resume': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to process resume: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_resumes(request):
    """
    List all resumes for the authenticated user.
    
    GET /api/resume/list/
    """
    resumes = Resume.objects.filter(user=request.user)
    serializer = ResumeSerializer(resumes, many=True)
    return Response({
        'resumes': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_resume(request, resume_id):
    """
    Get a specific resume by ID.
    
    GET /api/resume/{resume_id}/
    """
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
        serializer = ResumeSerializer(resume)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Resume.DoesNotExist:
        return Response({
            'error': 'Resume not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_resume(request, resume_id):
    """
    Delete a specific resume by ID.
    
    DELETE /api/resume/{resume_id}/
    """
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
        
        # Delete the file from storage
        if default_storage.exists(resume.file_path):
            default_storage.delete(resume.file_path)
        
        resume.delete()
        return Response({
            'message': 'Resume deleted successfully'
        }, status=status.HTTP_200_OK)
    except Resume.DoesNotExist:
        return Response({
            'error': 'Resume not found'
        }, status=status.HTTP_404_NOT_FOUND)

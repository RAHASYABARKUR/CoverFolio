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
# from .parser import parse_resume_text
# from .parser_ollama import parse_resume_with_ollama
from portfolio.views import populate_from_resume
from rest_framework.test import APIRequestFactory,force_authenticate
# from .text_extractor import extract_text_from_pdf_better
from .parser import parse_resume_llama,extract_text_from_pdf
from .resume_parser_gemini import parse_resume_gemini
# from portfolio.normalize import clean_structured
# from .parser import parse,extract_text_from_pdf

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    """
    Upload and parse a resume PDF file.
    
    POST /api/resume/upload/
    Body: FormData with 'file' field containing PDF file
    """
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']

    # CHG-2: restrict to PDF only (your backend enforces this)
    if not file.name.lower().endswith('.pdf'):
        return Response({'error': 'Only PDF files are allowed'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # CHG-3: save file first (unchanged)
        file_path = f"resumes/{request.user.id}/{file.name}"
        saved_path = default_storage.save(file_path, ContentFile(file.read()))
        full_file_path = default_storage.path(saved_path)
        print(full_file_path)
        try:
            #structured_data = parse_resume_llama(full_file_path)
            structured_data = parse_resume_gemini(full_file_path,api_key ="AIzaSyAZLyAlpUdTr5fKBfRZ9nRDWP6AoHRRsNY")
            print(structured_data)
            extracted_text = extract_text_from_pdf(full_file_path)
        except Exception as e:
            return Response(
                {'error': f'Failed to process resume: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


        # # ---------- EXTRACT ----------
        # # CHG-4: single, better extractor (avoid duplicate extraction)
        # try:
        #     extracted_text = extract_text_from_pdf_better(full_file_path) or ""
        #     print("EXTRACTED TEXT (preview):", extracted_text[:500])
        # except Exception as e:
        #     return Response(
        #         {'error': f'Failed to extract text from PDF: {str(e)}'},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )

        # # ---------- PARSE ----------
        # structured_data = None

        # # CHG-5: PRIMARY: Local LLaMA CPU parser (path-based)
        # try:
        #     print("Parsing via local LLaMA CPU parser…")
        #     structured_data = parse_resume_llama(full_file_path)  # returns dict or {}
        # except Exception as e:
        #     print(f"Warning: local LLaMA parser failed: {e}")

        # # CHG-6: FALLBACK #1: your lightweight regex/heuristic parser (if any)
        # if not structured_data:
        #     try:
        #         print("Falling back: parse_resume_text()…")
        #         structured_data = parse_resume_text(extracted_text.strip())
        #     except Exception as e:
        #         print(f"Warning: parse_resume_text failed: {e}")

        # # CHG-7: FALLBACK #2: Ollama (short timeout)
        # if not structured_data:
        #     try:
        #         print("Falling back: parse_resume_with_ollama()…")
        #         structured_data = parse_resume_with_ollama(
        #             extracted_text.strip(),
        #             model="llama3",
        #             timeout=30
        #         )
        #     except Exception as e:
        #         print(f"Warning: Ollama parser failed: {e}")

        # # CHG-8: OPTIONAL: normalize parsed output if you added normalize.py
        # if structured_data and clean_structured:
        #     try:
        #         structured_data = clean_structured(structured_data)
        #     except Exception as e:
        #         print(f"Warning: clean_structured failed: {e}")

        # print("STRUCTURED DATA (preview):", structured_data)

        # ---------- SAVE RESUME ----------
        # CHG-9: create the resume once, using the final structured_data
        print("Creating Resume record in DB…")
        print(structured_data)
        resume = Resume.objects.create(
            user=request.user,
            title=file.name.replace('.pdf', ''),
            file_path=saved_path,
            extracted_text=extracted_text.strip(),
            structured_data=structured_data or {}
        )
    # if 'file' not in request.FILES:
    #     return Response({
    #         'error': 'No file provided'
    #     }, status=status.HTTP_400_BAD_REQUEST)
    
    # file = request.FILES['file']
    
    # # Validate file type
    # if not file.name.lower().endswith('.pdf'):
    #     return Response({
    #         'error': 'Only PDF files are allowed'
    #     }, status=status.HTTP_400_BAD_REQUEST)
    
    # try:
    #     # Save file to media directory
    #     file_path = f"resumes/{request.user.id}/{file.name}"
    #     saved_path = default_storage.save(file_path, ContentFile(file.read()))
        
    #     # Extract text from PDF
    #     extracted_text = ""
    #     full_file_path = default_storage.path(saved_path)
    #     print(full_file_path)
    #     try:
    #             extracted_text = extract_text_from_pdf_better(full_file_path)
    #             print("EXTRACTED TEXT (preview):", extracted_text[:500])
    #             try:
    #                 # First: try your existing lightweight parser (if it exists & is fast)
    #                 structured_data = parse_resume_text(extracted_text.strip())
    #             except Exception as e:
    #                 print(f"Warning: parse_resume_text failed: {e}")

    #             # Second: if still None, try Ollama (may be slower; set small timeout)
    #             if structured_data is None:
    #                 try:
    #                     structured_data = parse_resume_with_ollama(
    #                         extracted_text.strip(),
    #                         model="llama3",      # or env/config
    #                         timeout=30           # keep this small to avoid long requests
    #                     )
    #                 except Exception as e:
    #                     print(f"Warning: Ollama parser failed: {e}")
    #             print("STRUCTURED DATA (preview):", structured_data)
    #     except Exception as e:
    #         return Response({
    #             'error': f'Failed to extract text from PDF: {str(e)}'
    #         }, status=status.HTTP_400_BAD_REQUEST)
        
    #     # Parse extracted text into structured data
    #     structured_data = None
    #     try:
    #         structured_data = parse_resume_text(extracted_text.strip())
    #     except Exception as e:
    #         # Don't fail if parsing fails, just log it
    #         print(f"Warning: Failed to parse resume structure: {str(e)}")
        
    #     # Create resume record
    #     resume = Resume.objects.create(
    #         user=request.user,
    #         title=file.name.replace('.pdf', ''),
    #         file_path=saved_path,
    #         extracted_text=extracted_text.strip(),
    #         structured_data=structured_data
    #     )

        serializer = ResumeSerializer(resume)
        # factory = APIRequestFactory()
        # populate_request = factory.post(f'/api/portfolio/populate-from-resume/{resume.id}/', {'overwrite': True})
        # populate_request.user = request.user
        # response = populate_from_resume(populate_request, resume.id)
        # print(" Portfolio auto-populate result:", response.data)
        # Auto-populate the portfolio from this resume, authenticated
        try:
            factory = APIRequestFactory()
            populate_req = factory.post(
                f'/api/portfolio/populate-from-resume/{resume.id}/',
                {'overwrite': True},
                format='json'
            )
            # IMPORTANT: authenticate the request so IsAuthenticated passes
            force_authenticate(populate_req, user=request.user)

            populate_resp = populate_from_resume(populate_req, resume.id)
            portfolio_result = getattr(populate_resp, 'data', None)
            print(" Portfolio auto-populate result:", portfolio_result)
        except Exception as e:
            # Don’t fail the upload if population fails
            print("⚠️ Portfolio auto-populate failed:", e)

        return Response({
            "message": "Resume uploaded and parsed successfully",
            "resume": serializer.data,
            "portfolio_result": portfolio_result  
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_cover_letter(request):
    """
    Generate a cover letter using resume data and job description.
    
    POST /api/resume/generate-cover-letter/
    Body: {
        "resume_id": 1,
        "role": "Software Engineer",
        "company_name": "Google",
        "job_description": "..."
    }
    """
    from .cover_letter_generator import generate_cover_letter_gemini
    
    resume_id = request.data.get('resume_id')
    role = request.data.get('role')
    job_description = request.data.get('job_description')
    company_name = request.data.get('company_name', '')
    
    if not resume_id or not role or not job_description:
        return Response({
            'error': 'Missing required fields: resume_id, role, job_description'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get the resume
        resume = Resume.objects.get(id=resume_id, user=request.user)
        
        if not resume.structured_data:
            return Response({
                'error': 'Resume has not been parsed yet'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate cover letter
        api_key = "AIzaSyAZLyAlpUdTr5fKBfRZ9nRDWP6AoHRRsNY"
        cover_letter = generate_cover_letter_gemini(
            resume_data=resume.structured_data,
            job_description=job_description,
            role=role,
            company_name=company_name,
            api_key=api_key
        )
        
        return Response({
            'cover_letter': cover_letter,
            'resume_data': resume.structured_data
        }, status=status.HTTP_200_OK)
        
    except Resume.DoesNotExist:
        return Response({
            'error': 'Resume not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to generate cover letter: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_ai_assistant(request):
    """
    Chat with AI assistant for help with resumes, cover letters, and portfolios.
    
    POST /api/resume/chat/
    Body: {
        "message": "Help me improve this section",
        "context": "Optional context (resume data, cover letter content, etc.)",
        "conversation_history": [
            {"role": "user", "content": "Previous message"},
            {"role": "assistant", "content": "Previous response"}
        ]
    }
    """
    from .chatbot import chat_with_ai, chat_with_conversation_history
    
    message = request.data.get('message')
    context = request.data.get('context', None)
    conversation_history = request.data.get('conversation_history', None)
    
    if not message:
        return Response({
            'error': 'Message is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if conversation_history:
            # Add current message to history
            conversation_history.append({'role': 'user', 'content': message})
            response_text = chat_with_conversation_history(conversation_history)
        else:
            response_text = chat_with_ai(message, context)
        
        return Response({
            'response': response_text,
            'message': message
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to get AI response: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

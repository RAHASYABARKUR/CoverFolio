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
from .resume_parser_gemini import parse_resume_gemini, extract_text_from_pdf
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
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("GEMINI_API_KEY not found in environment variables")
            structured_data = parse_resume_gemini(full_file_path,api_key =api_key)
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
        #api_key = "AIzaSyAZLyAlpUdTr5fKBfRZ9nRDWP6AoHRRsNY"
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")

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
    # context = request.data.get('context', None)
    conversation_history = request.data.get('conversation_history', None)
    resume_id = request.data.get('resume_id', None)
    context = None
    try:
        if resume_id:
            resume = Resume.objects.get(id=resume_id, user=request.user)
        else:
            # fallback: most recent resume
            resume = Resume.objects.filter(user=request.user).latest("id")

        context = f"""
STRUCTURED RESUME DATA:
{resume.structured_data}

FULL RESUME TEXT:
{resume.extracted_text}  # prevent huge context
        """
    except Exception as e:
        print("No resume context loaded:", e)
        context = None
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


# ============== COVER LETTER DRAFT ENDPOINTS ==============

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_cover_letter_draft(request):
    """
    Save a cover letter draft.
    
    POST /api/resume/cover-letters/save/
    Body: {
        "title": "Software Engineer at Google",
        "role": "Software Engineer",
        "company_name": "Google",
        "content": "Dear Hiring Manager,...",
        "template_style": "professional",
        "font_family": "Arial",
        "font_size": "medium",
        "text_align": "left",
        "resume_id": 1 (optional)
    }
    """
    from .models import CoverLetter
    
    title = request.data.get('title')
    role = request.data.get('role', '')
    company_name = request.data.get('company_name', '')
    content = request.data.get('content')
    template_style = request.data.get('template_style', 'professional')
    font_family = request.data.get('font_family', 'Arial')
    font_size = request.data.get('font_size', 'medium')
    text_align = request.data.get('text_align', 'left')
    resume_id = request.data.get('resume_id', None)
    
    if not title or not content:
        return Response({
            'error': 'Title and content are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        resume = None
        if resume_id:
            try:
                resume = Resume.objects.get(id=resume_id, user=request.user)
            except Resume.DoesNotExist:
                pass  # Resume is optional
        
        cover_letter = CoverLetter.objects.create(
            user=request.user,
            resume=resume,
            title=title,
            role=role,
            company_name=company_name,
            content=content,
            template_style=template_style,
            font_family=font_family,
            font_size=font_size,
            text_align=text_align
        )
        
        return Response({
            'message': 'Cover letter draft saved successfully',
            'cover_letter': {
                'id': cover_letter.id,
                'title': cover_letter.title,
                'role': cover_letter.role,
                'company_name': cover_letter.company_name,
                'content': cover_letter.content,
                'template_style': cover_letter.template_style,
                'font_family': cover_letter.font_family,
                'font_size': cover_letter.font_size,
                'text_align': cover_letter.text_align,
                'created_at': cover_letter.created_at.isoformat(),
                'updated_at': cover_letter.updated_at.isoformat(),
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to save cover letter draft: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_cover_letter_drafts(request):
    """
    List all cover letter drafts for the authenticated user.
    
    GET /api/resume/cover-letters/list/
    """
    from .models import CoverLetter
    
    try:
        cover_letters = CoverLetter.objects.filter(user=request.user)
        
        cover_letters_data = [{
            'id': cl.id,
            'title': cl.title,
            'role': cl.role,
            'company_name': cl.company_name,
            'content': cl.content,
            'template_style': cl.template_style,
            'font_family': cl.font_family,
            'font_size': cl.font_size,
            'text_align': cl.text_align,
            'created_at': cl.created_at.isoformat(),
            'updated_at': cl.updated_at.isoformat(),
        } for cl in cover_letters]
        
        return Response({
            'cover_letters': cover_letters_data,
            'count': len(cover_letters_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to list cover letter drafts: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cover_letter_draft(request, cover_letter_id):
    """
    Get a specific cover letter draft.
    
    GET /api/resume/cover-letters/<id>/
    """
    from .models import CoverLetter
    
    try:
        cover_letter = CoverLetter.objects.get(id=cover_letter_id, user=request.user)
        
        return Response({
            'id': cover_letter.id,
            'title': cover_letter.title,
            'role': cover_letter.role,
            'company_name': cover_letter.company_name,
            'content': cover_letter.content,
            'template_style': cover_letter.template_style,
            'font_family': cover_letter.font_family,
            'font_size': cover_letter.font_size,
            'text_align': cover_letter.text_align,
            'created_at': cover_letter.created_at.isoformat(),
            'updated_at': cover_letter.updated_at.isoformat(),
        }, status=status.HTTP_200_OK)
        
    except CoverLetter.DoesNotExist:
        return Response({
            'error': 'Cover letter not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cover_letter_draft(request, cover_letter_id):
    """
    Update a cover letter draft.
    
    PUT /api/resume/cover-letters/<id>/update/
    """
    from .models import CoverLetter
    
    try:
        cover_letter = CoverLetter.objects.get(id=cover_letter_id, user=request.user)
        
        # Update fields if provided
        if 'title' in request.data:
            cover_letter.title = request.data['title']
        if 'role' in request.data:
            cover_letter.role = request.data['role']
        if 'company_name' in request.data:
            cover_letter.company_name = request.data['company_name']
        if 'content' in request.data:
            cover_letter.content = request.data['content']
        if 'template_style' in request.data:
            cover_letter.template_style = request.data['template_style']
        if 'font_family' in request.data:
            cover_letter.font_family = request.data['font_family']
        if 'font_size' in request.data:
            cover_letter.font_size = request.data['font_size']
        if 'text_align' in request.data:
            cover_letter.text_align = request.data['text_align']
        
        cover_letter.save()
        
        return Response({
            'message': 'Cover letter updated successfully',
            'cover_letter': {
                'id': cover_letter.id,
                'title': cover_letter.title,
                'role': cover_letter.role,
                'company_name': cover_letter.company_name,
                'content': cover_letter.content,
                'template_style': cover_letter.template_style,
                'font_family': cover_letter.font_family,
                'font_size': cover_letter.font_size,
                'text_align': cover_letter.text_align,
                'created_at': cover_letter.created_at.isoformat(),
                'updated_at': cover_letter.updated_at.isoformat(),
            }
        }, status=status.HTTP_200_OK)
        
    except CoverLetter.DoesNotExist:
        return Response({
            'error': 'Cover letter not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cover_letter_draft(request, cover_letter_id):
    """
    Delete a cover letter draft.
    
    DELETE /api/resume/cover-letters/<id>/delete/
    """
    from .models import CoverLetter
    
    try:
        cover_letter = CoverLetter.objects.get(id=cover_letter_id, user=request.user)
        cover_letter.delete()
        
        return Response({
            'message': 'Cover letter deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except CoverLetter.DoesNotExist:
        return Response({
            'error': 'Cover letter not found'
        }, status=status.HTTP_404_NOT_FOUND)


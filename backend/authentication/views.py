

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate, get_user_model
from .serializers import (
   RegisterSerializer,
   LoginSerializer,
   UserSerializer,
   ChangePasswordSerializer
)


User = get_user_model()




@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
   """
   Register a new user.
  
   POST /api/auth/register/
   Body: {
       "email": "user@example.com",
       "password": "securepassword",
       "password2": "securepassword",
       "first_name": "John",
       "last_name": "Doe"
   }
   """
   serializer = RegisterSerializer(data=request.data)
  
   if serializer.is_valid():
       user = serializer.save()
      
       # Generate tokens for the new user
       refresh = RefreshToken.for_user(user)
      
       return Response({
           'message': 'User registered successfully',
           'user': UserSerializer(user).data,
           'tokens': {
               'refresh': str(refresh),
               'access': str(refresh.access_token),
           }
       }, status=status.HTTP_201_CREATED)
  
   return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
   """
   Login user and return JWT tokens.
  
   POST /api/auth/login/
   Body: {
       "email": "user@example.com",
       "password": "securepassword"
   }
   """
   serializer = LoginSerializer(data=request.data)
  
   if not serializer.is_valid():
       # Return validation errors (e.g., invalid email format)
       errors = serializer.errors
       if 'email' in errors:
           return Response({
               'error': 'Please enter a valid email address',
               'field': 'email'
           }, status=status.HTTP_400_BAD_REQUEST)
       if 'password' in errors:
           return Response({
               'error': 'Password is required',
               'field': 'password'
           }, status=status.HTTP_400_BAD_REQUEST)
       return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
   email = serializer.validated_data['email']
   password = serializer.validated_data['password']
  
   # Check if user exists (for better error message, but don't reveal to client)
   try:
       user_exists = User.objects.filter(email=email).exists()
   except:
       user_exists = False
  
   user = authenticate(request, username=email, password=password)
  
   if user is not None:
       if user.is_active:
           # Generate tokens
           refresh = RefreshToken.for_user(user)
          
           return Response({
               'message': 'Login successful',
               'user': UserSerializer(user).data,
               'tokens': {
                   'refresh': str(refresh),
                   'access': str(refresh.access_token),
               }
           }, status=status.HTTP_200_OK)
       else:
           return Response({
               'error': 'Your account has been disabled. Please contact support.',
               'field': 'account'
           }, status=status.HTTP_403_FORBIDDEN)
   else:
       # For security: Don't reveal whether email exists or password is wrong
       # This prevents user enumeration attacks
       return Response({
           'error': 'Invalid email or password. Please check your credentials and try again.',
           'field': 'credentials'
       }, status=status.HTTP_401_UNAUTHORIZED)
  
   return Response({
       'error': 'Invalid request. Please try again.'
   }, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
   """
   Logout user by blacklisting the refresh token.
  
   POST /api/auth/logout/
   Body: {
       "refresh": "refresh_token_here"
   }
   """
   try:
       refresh_token = request.data.get('refresh')
       if refresh_token:
           token = RefreshToken(refresh_token)
           token.blacklist()
           return Response({
               'message': 'Logout successful'
           }, status=status.HTTP_200_OK)
       else:
           return Response({
               'error': 'Refresh token is required'
           }, status=status.HTTP_400_BAD_REQUEST)
   except Exception as e:
       return Response({
           'error': 'Invalid token or token already blacklisted'
       }, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
   """
   Get current user profile.
  
   GET /api/auth/profile/
   """
   serializer = UserSerializer(request.user)
   return Response(serializer.data, status=status.HTTP_200_OK)




@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
   """
   Update current user profile.
  
   PUT/PATCH /api/auth/profile/update/
   Body: {
       "first_name": "John",
       "last_name": "Doe"
   }
   """
   user = request.user
   serializer = UserSerializer(user, data=request.data, partial=True)
  
   if serializer.is_valid():
       serializer.save()
       return Response({
           'message': 'Profile updated successfully',
           'user': serializer.data
       }, status=status.HTTP_200_OK)
  
   return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
   """
   Change user password.
  
   POST /api/auth/change-password/
   Body: {
       "old_password": "oldpassword",
       "new_password": "newpassword"
   }
   """
   serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
  
   if serializer.is_valid():
       user = request.user
       user.set_password(serializer.validated_data['new_password'])
       user.save()
      
       return Response({
           'message': 'Password changed successfully'
       }, status=status.HTTP_200_OK)
  
   return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token_view(request):
   """
   Verify if the token is valid.
  
   GET /api/auth/verify/
   """
   return Response({
       'message': 'Token is valid',
       'user': UserSerializer(request.user).data
   }, status=status.HTTP_200_OK)


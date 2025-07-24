"""Unit tests for logout functionality."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from idtap_api.client import SwaraClient
from idtap_api.secure_storage import SecureTokenStorage


class TestLogoutFunctionality:
    """Test cases for the logout method."""

    @patch('idtap_api.client.login_google')
    def test_logout_success(self, mock_login):
        """Test successful logout."""
        # Mock the authentication
        mock_login.return_value = {
            'id_token': 'fake_token',
            'profile': {'name': 'Test User', '_id': 'test123'}
        }
        
        # Create client and mock storage
        client = SwaraClient()
        client.token = 'fake_token'
        client.user = {'name': 'Test User', '_id': 'test123'}
        
        # Mock the secure storage clear_tokens method
        client.secure_storage.clear_tokens = Mock(return_value=True)
        
        # Test logout with confirmation
        with patch('builtins.input', return_value='yes'):
            result = client.logout()
        
        # Verify logout was successful
        assert result is True
        assert client.token is None
        assert client.user is None
        client.secure_storage.clear_tokens.assert_called_once()

    @patch('idtap_api.client.login_google')
    def test_logout_cancelled(self, mock_login):
        """Test logout cancellation."""
        # Mock the authentication
        mock_login.return_value = {
            'id_token': 'fake_token', 
            'profile': {'name': 'Test User', '_id': 'test123'}
        }
        
        client = SwaraClient()
        client.token = 'fake_token'
        client.user = {'name': 'Test User', '_id': 'test123'}
        
        # Mock storage
        client.secure_storage.clear_tokens = Mock(return_value=True)
        
        # Test logout cancellation
        with patch('builtins.input', return_value='no'):
            result = client.logout()
        
        # Verify logout was cancelled and state preserved
        assert result is False
        assert client.token == 'fake_token'
        assert client.user == {'name': 'Test User', '_id': 'test123'}
        client.secure_storage.clear_tokens.assert_not_called()

    @patch('idtap_api.client.login_google')
    def test_logout_programmatic(self, mock_login):
        """Test programmatic logout without confirmation."""
        # Mock the authentication
        mock_login.return_value = {
            'id_token': 'fake_token',
            'profile': {'name': 'Test User', '_id': 'test123'}
        }
        
        client = SwaraClient()
        client.token = 'fake_token'
        client.user = {'name': 'Test User', '_id': 'test123'}
        
        # Mock storage
        client.secure_storage.clear_tokens = Mock(return_value=True)
        
        # Test programmatic logout (no user input required)
        result = client.logout(confirm=True)
        
        # Verify logout was successful
        assert result is True
        assert client.token is None
        assert client.user is None
        client.secure_storage.clear_tokens.assert_called_once()

    @patch('idtap_api.client.login_google')
    def test_logout_storage_failure(self, mock_login):
        """Test logout when storage clearing fails."""
        # Mock the authentication
        mock_login.return_value = {
            'id_token': 'fake_token',
            'profile': {'name': 'Test User', '_id': 'test123'}
        }
        
        client = SwaraClient()
        client.token = 'fake_token'
        client.user = {'name': 'Test User', '_id': 'test123'}
        
        # Mock storage failure
        client.secure_storage.clear_tokens = Mock(return_value=False)
        
        # Test logout with storage failure
        result = client.logout(confirm=True)
        
        # Verify partial failure is handled
        assert result is False
        client.secure_storage.clear_tokens.assert_called_once()

    @patch('idtap_api.client.login_google')
    def test_logout_exception_handling(self, mock_login):
        """Test logout exception handling."""
        # Mock the authentication
        mock_login.return_value = {
            'id_token': 'fake_token',
            'profile': {'name': 'Test User', '_id': 'test123'}
        }
        
        client = SwaraClient()
        client.token = 'fake_token'
        client.user = {'name': 'Test User', '_id': 'test123'}
        
        # Mock storage to raise exception
        client.secure_storage.clear_tokens = Mock(side_effect=Exception("Storage error"))
        
        # Test logout with exception
        result = client.logout(confirm=True)
        
        # Verify exception is handled gracefully
        assert result is False
        client.secure_storage.clear_tokens.assert_called_once()


class TestSecureTokenStorage:
    """Test cases for SecureTokenStorage clear_tokens method."""
    
    def test_clear_tokens_method_exists(self):
        """Verify the clear_tokens method exists."""
        storage = SecureTokenStorage()
        assert hasattr(storage, 'clear_tokens')
        assert callable(getattr(storage, 'clear_tokens'))
    
    @patch('pathlib.Path.exists')
    @patch('pathlib.Path.unlink')
    def test_clear_tokens_removes_files(self, mock_unlink, mock_exists):
        """Test that clear_tokens removes all token files."""
        # Mock files exist
        mock_exists.return_value = True
        
        storage = SecureTokenStorage()
        
        # Mock keyring operations
        with patch('idtap_api.secure_storage.KEYRING_AVAILABLE', True), \
             patch('idtap_api.secure_storage.keyring.delete_password') as mock_delete:
            
            result = storage.clear_tokens()
            
            # Verify keyring deletion was attempted
            mock_delete.assert_called_once()
            
            # Verify file deletions were attempted
            assert mock_unlink.call_count >= 1  # Should try to delete encrypted and plaintext files
            assert result is True
#!/usr/bin/env python3
"""
Examples of how to use the logout functionality in different scenarios.
"""

from idtap_api import SwaraClient

def example_interactive_logout():
    """Example: Interactive logout with user confirmation."""
    print("=== Interactive Logout Example ===")
    
    client = SwaraClient()
    
    # This will prompt the user for confirmation
    client.logout()

def example_programmatic_logout():
    """Example: Programmatic logout for scripts/automation."""
    print("=== Programmatic Logout Example ===")
    
    client = SwaraClient()
    
    # Skip confirmation prompt for automated scripts  
    success = client.logout(confirm=True)
    
    if success:
        print("Logout successful - ready for next user")
    else:
        print("Logout failed - check permissions")

def example_multi_user_workflow():
    """Example: Switching between multiple Google accounts."""
    print("=== Multi-User Workflow Example ===")
    
    # User 1 session
    print("Starting session for User 1...")
    client1 = SwaraClient()  # Will authenticate as current stored user
    
    if client1.user:
        print(f"Working as: {client1.user.get('name')}")
        
        # Do some work...
        transcriptions = client1.get_viewable_transcriptions()
        print(f"Found {len(transcriptions)} transcriptions")
        
        # Log out to clear tokens
        print("Switching users...")
        client1.logout(confirm=True)
    
    # User 2 session
    print("Starting session for User 2...")
    client2 = SwaraClient()  # Will prompt for new authentication
    
    if client2.user:
        print(f"Now working as: {client2.user.get('name')}")
        # Continue with User 2's work...

def example_session_cleanup():
    """Example: Clean session termination."""
    print("=== Session Cleanup Example ===")
    
    client = SwaraClient()
    
    try:
        # Do your API work here
        transcriptions = client.get_viewable_transcriptions()
        print(f"Processed {len(transcriptions)} transcriptions")
        
        # Other work...
        
    finally:
        # Always clean up tokens when done
        print("Cleaning up session...")
        client.logout(confirm=True)
        print("Session terminated cleanly")

def example_check_auth_status():
    """Example: Check authentication status and logout if needed."""
    print("=== Check Auth Status Example ===")
    
    client = SwaraClient()
    
    if client.user:
        print(f"Currently authenticated as: {client.user.get('name')}")
        print(f"Waiver status: {client.has_agreed_to_waiver()}")
        
        # Check if user wants to logout
        response = input("Do you want to logout? (yes/no): ").strip().lower()
        if response == 'yes':
            client.logout(confirm=True)
    else:
        print("No active authentication found")

if __name__ == "__main__":
    print("🔐 IDTAP Logout Examples")
    print("Uncomment the example you want to run:\n")
    
    # Uncomment one of these to run:
    # example_interactive_logout()
    # example_programmatic_logout() 
    # example_multi_user_workflow()
    # example_session_cleanup()
    example_check_auth_status()

Instruction File for Virtual Office Application
Application Overview
The Virtual Office Application is a digital platform designed to replicate a physical office environment for remote teams. It provides users with an interactive workspace featuring communication, collaboration, and gamification tools to enhance engagement and productivity. The application integrates seamlessly with Google Workspace, ensuring streamlined workflows and communication.

Features and Functionality

1. Office Layout & Navigation
Visual Floor Plan Representation: A graphical layout of the office space showing different room types.
Room Types:
Team Rooms
Meeting Rooms
Corner Offices
Personal Office Spaces
User Seat Management:
Users can have assigned seats/offices.
"My Seat" Feature: Quickly navigate to the user’s home office location.

2. User Presence & Status
Real-Time Presence Indicators: Display users' current status on the floor plan.
Status Options:
Online
Busy
Away
Offline
Status Customization: Users can set custom status messages.
Assigned Offices: Easily view assigned seats for each user.

3. Communication Features
Google Workspace Integration:
Chat: Messaging capabilities via Google Chat.
Spaces: Room-based communication.
Meet: Video conferencing directly integrated.
Direct Messaging: One-on-one communication.
Team/Room-Based Messaging: Group messaging for collaboration.
Audio Features:
Users can assign personal theme songs to their profiles.

4. Leaderboard & Gamification
Sales Leaderboard: Tracks deals closed by team members.
Call Leaderboard: Tracks daily calls made by users.
Performance Metrics:
Visibility into individual and team performance.
Gamified approach to encourage healthy competition.

5. User Management
User Profiles: Customizable with avatars and theme songs.
Role-Based Access:
Admin: Full permissions to manage users and configurations.
Regular User: Limited permissions based on role.
Office Assignment Management: Assign users to specific rooms or spaces.

6. Interactive Features
Real-Time Updates:
User location on the floor plan.
Presence status.
Audio Controls:
Play/pause theme songs.
Manage sound effects for interactive features.
Room Assignments:
Dynamically allocate users to different rooms.
Manage user movement across spaces.

7. Customization
Company Branding:
Upload and display the company logo.
Personalization:
Assign personal theme songs.
Customize office layouts to fit organizational needs.

8. Authentication & Security
User Authentication:
Secure login/logout process.
Integration with Google Workspace for single sign-on (SSO).
Role-Based Permissions:
Access controlled by user roles (e.g., Admin, Regular User).
Backend Security:
Firebase-based security rules ensure data safety.
Technology Stack
Frontend:
React + TypeScript for dynamic and typed UI development.
Vite as the build tool for fast development cycles.
Tailwind CSS for responsive and modern styling.
Shadcn/UI components for polished interfaces.
Backend:
Firebase for authentication, real-time database, and hosting.
Integration:
Google Workspace for chat, video, and collaborative features.
Admin Setup Instructions
Google Workspace Connection:
Authenticate the application with Google Workspace Admin credentials.
Select team members for the virtual office from the Google Workspace directory.
Floor Plan Configuration:
Customize the office layout to match team requirements.
Assign team members to specific rooms or areas.
Company Branding:
Upload the company logo for consistent branding across the application.
User Management:
Assign roles and permissions to team members.
Configure default theme songs and avatars for new users.
Sales Floor Management:
Use the interface to select and configure the sales floor or other designated team floors.
User Workflow
Login:
Users log in via their Google Workspace credentials.
Navigation:
Navigate through the digital floor plan.
Locate and interact with team members based on their presence and status.
Communication:
Use Google Chat for direct and group messaging.
Initiate video conferences via Google Meet.
Engagement:
Monitor personal and team performance on leaderboards.
Customize user profiles with theme songs and avatars.
Additional Notes
Audio Features: Ensure personal theme songs are non-intrusive and comply with company policies.
Performance Metrics: Encourage healthy competition by celebrating leaderboard achievements during team meetings.
Real-Time Updates: Periodically verify Firebase real-time updates for accuracy and performance.
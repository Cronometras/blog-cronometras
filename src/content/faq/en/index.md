---
title: "Frequently Asked Questions about CronometrasApp"
description: "Find answers to the most common questions about CronometrasApp, its features, and how to use it."
---

# Frequently Asked Questions about CronometrasApp

## 1. What are the main features of the CronometrasApp dashboard?

The CronometrasApp dashboard provides an overview and access to study management, including viewing your own and shared studies, creating, editing (owner only), deleting (owner only), and sharing studies with organization members. It also facilitates organizing and locating studies through company and date filters, as well as a search function by name or keywords. Additionally, the dashboard provides alerts and notifications about editing permissions, changes to shared studies, and informational messages about actions performed in the application.

## 2. What is the process for creating a new study in CronometrasApp and what fields are required?

To create a new study, the user must access the dashboard and click on the "Create Study" button, which will direct them to the /study route. The system will verify if the user has available credits. A form will be presented with mandatory fields such as study name, company, date, and activity scale (normal and optimal). There are also optional fields such as study number, operator, section, reference, machine, tools, and technician. The form is pre-filled with default values from the user's profile for the activity scale. Upon saving, the study is created and automatically shared with the user's organization (if they belong to one), and the user is redirected to the dashboard with the new study selected.

## 3. How are work elements managed in the Method screen of CronometrasApp?

The Method screen allows users to define and manage the work elements of a time study. Existing elements can be viewed with detailed information such as sequential number, description, repetition type (repetitive, frequency, machine), and frequency. Users can create new elements through a modal form that includes fields for description, element type according to the man-machine relationship (machine stopped, running, machine time), and according to its repetition (repetitive, frequency), as well as frequency (repetitions and cycles). The option to add elements from a pre-existing library, edit them, or delete them is also offered. Additionally, voice recognition for element description and security features such as ownership verification to allow modifications are included.

## 4. What does the Repetitive Times screen (ChronometerPage) in CronometrasApp allow during a study?

The Repetitive Times screen is essential for measuring and recording the execution times of elements defined as "repetitive." It allows the selection of repetitive elements to include in the measurement, a stopwatch with basic controls (start/pause, stop, next element), adjustment of operator activity within a defined range, time record management with visualization, editing (time, activity, frequency, comments), and deletion. It also provides key statistics per element, such as total number of takes, average time, total accumulated time, average activity, and recommended remaining takes. Navigation between elements is simple, and the system offers alerts in case of attempting to edit studies that don't belong to you.

## 5. How is the Continuous Timing screen (CronoSeguido) used and what is its relationship with the Method screen?

The Continuous Timing screen allows recording times sequentially without previously classifying them into elements. It has a basic stopwatch and the function of recording successive times with the option to add descriptions via text or voice. Records are displayed in an editable and reorderable list. The screen offers general statistics such as total time and number of takes. Its main integration with the Method screen lies in the ability to transfer individual or mass records from CronoSeguido to Method, creating new elements or adding times to existing elements. Transferred records are visually identified, and it is possible to revert the assignment. This functionality is useful for the initial observation of a process, allowing the method to be structured later.

## 6. What is the utility of the Element Library in CronometrasApp and how does it facilitate the creation of new studies?

The Element Library allows users to search, select, and reuse work elements created in previous studies, promoting consistency and efficiency. It offers search and filtering functionalities, visualization of element details (including historical times and supplements), and the ability to select multiple elements to average their times and supplements, creating optimized new elements. Additionally, from the library, users can select elements (individual or averaged) and create a new study, preloading the study information and selected elements. This saves time and ensures standardization of common elements across different studies.

## 7. How are supplements managed in CronometrasApp and what table systems are available?

The Supplements screen in CronometrasApp is designed to calculate and apply the necessary supplements to work elements. It offers selection between two table systems: the ILO (International Labour Organization) tables version 4 and the TAL tables (based on the ILO tables but with more objectified criteria). Users can dynamically switch between these systems. The screen displays a complete list of method elements with assigned supplements and allows quick actions such as copying or resetting supplements. Supplement assignment is done through a point system for categorized factors (physical effort, mental effort, and working conditions) with interactive tables and automatic percentage calculation. Direct forcing of supplements by assigning a percentage directly is also allowed. For machine elements, a specific fatigue calculation is offered based on activity and inactivity times. All changes are automatically saved and synchronized, with permission checks and alerts for shared studies.

## 8. What type of information and functionalities does the Report screen of CronometrasApp offer at the end of a time study?

The Report screen provides a comprehensive and detailed analysis of the time studies performed. It allows configuring parameters such as time units and shift duration, and displays an element table with detailed information including observed times, activity, supplements, and final time. It presents key study results such as normal and optimal cycle, contingency times, estimated production per shift and hour (normal and optimal), operator saturation, and maximum achievable activity. Each metric includes information about its calculation. The report offers data export functionality in PDF and Excel format, including the company logo and study data. It performs advanced calculations considering element frequency, activity normalization, applied supplements, machine element management, and conversion between different industrial time units.

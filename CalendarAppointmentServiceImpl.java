package com.q4magic.calendar.calendarAppointment.serviceImpl;

import com.q4magic.calendar.calendarAppointment.service.CalendarAppointmentService;
import com.q4magic.common.dto.*;
import com.q4magic.common.dto.googleCalendar.GoogleCalendarDto;
import com.q4magic.common.dto.outlookCalendar.OutlookCalendarDto;
import com.q4magic.common.googleCalendar.service.GoogleCalendarService;
import com.q4magic.common.models.*;
import com.q4magic.common.models.Calendar;
import com.q4magic.common.repository.*;
import com.q4magic.common.service.CommonService;
import com.q4magic.util.ICS;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Time;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import com.q4magic.common.outlookCalendar.service.OutlookCalendarService;
import com.q4magic.common.repository.CalendarDetailsRepository;

@Service(value = "CalendarAppointmentService")
public class CalendarAppointmentServiceImpl implements CalendarAppointmentService {
    @Value("${server.database.timezone}")
    String serverDatabaseTimeZone;

    @Value("${companyName}")
    String companyName;

    @Value("${icsdownload-dir}")
    private String icsDownloadPath;

    @Value("${siteNameBigCom}")
    String siteNameBigCom;

    @Value("${siteUrl}")
    String siteUrl;

    @Autowired
    private CalendarAppointmentAvailabilitySlotsRepository calendarAppointmentAvailabilitySlotsRepository;

    @Autowired
    private CustomersRepository customersRepository;

    @Autowired
    private CommonService commonService;

    @Autowired
    private CalendarRepository calendarRepository;

    @Autowired
    private CalendarDetailsRepository calendarDetailsRepository;

    @Autowired
    private GoogleCalendarService googleCalendarService;

    @Autowired
    private OutlookCalendarService outlookCalendarService;

    @Autowired
    private CalendarAppointmentEventTypeRepository calendarAppointmentEventTypeRepository;

    @Autowired
    private CalendarNotificationRepository calendarNotificationRepository;

    @Override
    public List<CalendarAppointmentAvailabilitySlotsDto> getAvailabilitySlotsList(Integer cusId) {
        try {
            List<CalendarAppointmentAvailabilitySlots> calendarAppointmentAvailabilitySlots = calendarAppointmentAvailabilitySlotsRepository
                    .findByCustomerId(cusId);
            List<CalendarAppointmentAvailabilitySlotsDto> availabilitySlotsListResponseDtos = new ArrayList<>();
            if (!calendarAppointmentAvailabilitySlots.isEmpty()) {
                for (CalendarAppointmentAvailabilitySlots availabilitySlots : calendarAppointmentAvailabilitySlots) {
                    CalendarAppointmentAvailabilitySlotsDto availabilitySlotsDto = new CalendarAppointmentAvailabilitySlotsDto();
                    availabilitySlotsDto.setId(availabilitySlots.getId());
                    availabilitySlotsDto.setDayName(availabilitySlots.getDayName());
                    availabilitySlotsDto.setAvailable(availabilitySlots.getAvailable());
                    availabilitySlotsDto.setStartTime(availabilitySlots.getStartTime().toString());
                    availabilitySlotsDto.setEndTime(availabilitySlots.getEndTime().toString());
                    availabilitySlotsDto.setAvailable(availabilitySlots.getAvailable());
                    availabilitySlotsListResponseDtos.add(availabilitySlotsDto);
                }
            }
            return availabilitySlotsListResponseDtos;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    @Override
    public Map<String, Object> saveAvailabilitySlots(Integer cusId,
            List<CalendarAppointmentAvailabilitySlotsDto> list) {
        Map<String, Object> resBody = new HashMap<>();
        resBody.put("error", "");
        try {
            for (CalendarAppointmentAvailabilitySlotsDto dto : list) {
                CalendarAppointmentAvailabilitySlots availabilitySlots = this.calendarAppointmentAvailabilitySlotsRepository
                        .findById(dto.getId()).orElse(new CalendarAppointmentAvailabilitySlots());
                Customers customers = this.customersRepository.findById(dto.getCusId())
                        .orElseThrow(() -> new RuntimeException("Customer Not Found"));
                availabilitySlots.setCreatedDate(new Timestamp(System.currentTimeMillis()));
                availabilitySlots.setDayName(dto.getDayName());
                availabilitySlots.setAvailable(dto.getAvailable());

                availabilitySlots.setStartTime(Time.valueOf(dto.getStartTime()));
                availabilitySlots.setEndTime(Time.valueOf(dto.getEndTime()));
                availabilitySlots.setCustomers(customers);
                availabilitySlots.setCreatedDate(new Timestamp(System.currentTimeMillis()));
                this.calendarAppointmentAvailabilitySlotsRepository.save(availabilitySlots);
            }

        } catch (Exception e) {
            e.printStackTrace();
            resBody.put("error", e.getMessage());
        }

        return resBody;
    }

    @Override
    public Map<String, Object> freeSlotList(String userTimeZone, FreeSlotListDto freeSlotListDto) {
        Map<String, Object> resBody = new HashMap<>();
        try {
            Customers customers = this.customersRepository.findById(freeSlotListDto.getSlotUserId())
                    .orElseThrow(() -> new RuntimeException("Customer Not Found"));

            if (freeSlotListDto.getSlotDateTime().length() > 10) {
                freeSlotListDto.setSlotDateTime(this.commonService.convertEventTimeZoneToUser(
                        freeSlotListDto.getSlotDateTime(), freeSlotListDto.getTimeZone(), serverDatabaseTimeZone));
            }

            String aasDayName = this.commonService.dayName(freeSlotListDto.getSlotDateTime());
            CalendarAppointmentAvailabilitySlots availabilitySlots = null;
            try {
                availabilitySlots = this.calendarAppointmentAvailabilitySlotsRepository.findSlot(customers.getId(),
                        aasDayName);
            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException(e);
            }

            String startTime = "00:00:00";
            String endTime = "24:00:00";

            String aasAvailableYN = "Y";
            if (availabilitySlots != null) {
                startTime = availabilitySlots.getStartTime().toString();
                endTime = availabilitySlots.getEndTime().toString();
                aasAvailableYN = availabilitySlots.getAvailable();

                String memberTimeZone = userTimeZone;

                String tempStartDateTime = this.commonService.convertEventTimeZoneToUser(
                        freeSlotListDto.getSlotDateTime().substring(0, 10) + " " + startTime, memberTimeZone,
                        freeSlotListDto.getTimeZone());

                String tempEndDateTime = this.commonService.convertEventTimeZoneToUser(
                        freeSlotListDto.getSlotDateTime().substring(0, 10) + " " + endTime, memberTimeZone,
                        freeSlotListDto.getTimeZone());

                String[] tempStart = tempStartDateTime.split(" ");
                String[] tempEnd = tempEndDateTime.split(" ");
                if (tempStart[0].equals(tempEnd[0])) {
                    startTime = this.commonService.lastCharaters(tempStartDateTime, 8);
                    endTime = this.commonService.lastCharaters(tempEndDateTime, 8);
                } else {
                    startTime = this.commonService.lastCharaters(tempStartDateTime, 8);
                    endTime = "24:00:00";
                    if (!tempStart[0].equals(freeSlotListDto.getSlotDateTime().substring(0, 10))) {
                        startTime = this.commonService.remainingTime(freeSlotListDto.getSlotTimeMinus(), startTime,
                                endTime);
                        endTime = this.commonService.lastCharaters(tempEndDateTime, 8);
                    }
                }
            }

            List<String> slotList = new ArrayList<>();
            if (aasAvailableYN.equals("Y")) {
                slotList = this.commonService.slotList(freeSlotListDto.getSlotTimeMinus(), startTime, endTime);
                // Current Date Slot List Start
                if (freeSlotListDto.getCurrentDateYN().equals("Y")) {
                    List<String> slotNewList = new ArrayList<>();
                    for (String sl : slotList) {
                        if (this.commonService.checkBigFirstTime(sl,
                                this.commonService.currentTime(freeSlotListDto.getTimeZone()))) {
                            slotNewList.add(sl);
                        }
                    }
                    slotList = slotNewList;
                }

                String slotDateTime = "";
                try {
                    if (Objects.nonNull(freeSlotListDto.getSlotDateTime())) {
                        slotDateTime = this.commonService.dbDate(freeSlotListDto.getSlotDateTime());
                    }
                } catch (ParseException e) {
                    e.printStackTrace();
                }
                List<com.q4magic.common.models.Calendar> bookSlotList = (slotDateTime != null
                        && !slotDateTime.trim().isEmpty())
                                ? this.calendarRepository.findBookList(customers.getId(), slotDateTime)
                                : Collections.emptyList();
                Boolean calAllDay = false;
                for (com.q4magic.common.models.Calendar bookSlot : bookSlotList) {
                    startTime = this.commonService.displayDbDateTimeToTime(this.commonService
                            .convertEventTimeZoneToUserDB(bookSlot.getCalStartDateTime().toString().substring(0, 19),
                                    serverDatabaseTimeZone, freeSlotListDto.getTimeZone())
                            .substring(0, 19));
                    endTime = this.commonService.displayDbDateTimeToTime(this.commonService
                            .convertEventTimeZoneToUserDB(bookSlot.getCalEndDateTime().toString().substring(0, 19),
                                    serverDatabaseTimeZone, freeSlotListDto.getTimeZone())
                            .substring(0, 19));
                    calAllDay = Boolean.valueOf(bookSlot.getCalAllDay());
                    if (calAllDay) {
                        break;
                    }
                    slotList = this.commonService.removeBookSlot(freeSlotListDto.getSlotTimeMinus(), slotList,
                            startTime, endTime);
                }

                if (calAllDay) {
                    slotList = new ArrayList<>();
                }
            }
            resBody.put("freeSlotList", slotList);
        } catch (Exception e) {
            e.printStackTrace();
            new RuntimeException(e.getMessage());
        }
        return resBody;

    }

    @Override
    public Map<String, Object> saveAppointment(CalendarDto calendarDto) {
        Map<String, Object> map = new HashMap<>();
        map.put("customerId", calendarDto.getCustomerId());
        map.put("calAetId", calendarDto.getCalAetId());
        map.put("title", calendarDto.getTitle());
        map.put("description", calendarDto.getDescription());
        map.put("calTimeZone", calendarDto.getCalTimeZone());
        map.put("memTimeZone", calendarDto.getMemTimeZone());
        map.put("calAttendees", calendarDto.getCalAttendees());
        map.put("slotTimeMinus", calendarDto.getSlotTimeMinus());
        map.put("contactList", calendarDto.getContactList());
        map.put("currentDateYN", calendarDto.getCurrentDateYN());
        if (calendarDto.getStart() != null) {
            Map<String, String> slot = new HashMap<>();
            slot.put("start", calendarDto.getStart());
            slot.put("end", calendarDto.getEnd());
            map.put("timeSlots", Collections.singletonList(slot));
        }
        return saveAppointment(map);
    }

    @Override
    public Map<String, Object> saveAppointment(Map<String, Object> calendarData) {
        Map<String, Object> resBody = new HashMap<>();
        resBody.put("error", "");
        try {
            Integer cusId = Integer.parseInt(calendarData.get("customerId").toString());
            Customers customers = this.customersRepository.findById(cusId)
                    .orElseThrow(() -> new RuntimeException("Customer not found!"));

            String calTimeZone = calendarData.get("calTimeZone") != null ? calendarData.get("calTimeZone").toString()
                    : "";
            String memTimeZone = calendarData.get("memTimeZone") != null ? calendarData.get("memTimeZone").toString()
                    : "";
            if (calTimeZone.isEmpty()) {
                Map<String, Object> innerResBody = this.googleCalendarService.getUserTimezone(cusId);
                if (innerResBody != null && innerResBody.get("calTimeZone") != null) {
                    calTimeZone = innerResBody.get("calTimeZone").toString();
                }
            }

            String title = calendarData.get("title") != null ? calendarData.get("title").toString() : "";
            String description = calendarData.get("description") != null ? calendarData.get("description").toString()
                    : "";
            String calAttendees = calendarData.get("calAttendees") != null ? calendarData.get("calAttendees").toString()
                    : "{\"attendees\":[]}";
            Object calAetIdObj = calendarData.get("calAetId");
            Long calAetId = calAetIdObj != null && !calAetIdObj.toString().isEmpty()
                    ? Long.parseLong(calAetIdObj.toString())
                    : 0L;
            Object slotTimeMinusObj = calendarData.get("slotTimeMinus");
            Long slotTimeMinus = slotTimeMinusObj != null && !slotTimeMinusObj.toString().isEmpty()
                    ? Long.parseLong(slotTimeMinusObj.toString())
                    : 0L;
            String currentDateYN = calendarData.get("currentDateYN") != null
                    ? calendarData.get("currentDateYN").toString()
                    : "N";

            List<Map<String, String>> timeSlots = new ArrayList<>();
            if (calendarData.get("timeSlots") instanceof List) {
                List<?> rawSlots = (List<?>) calendarData.get("timeSlots");
                for (Object item : rawSlots) {
                    if (item instanceof Map) {
                        Map<?, ?> slotMap = (Map<?, ?>) item;
                        Map<String, String> s = new HashMap<>();
                        s.put("start", slotMap.get("start") != null ? slotMap.get("start").toString() : "");
                        s.put("end", slotMap.get("end") != null ? slotMap.get("end").toString() : "");
                        timeSlots.add(s);
                    }
                }
            }
            if (timeSlots.isEmpty() && calendarData.get("start") != null) {
                Map<String, String> s = new HashMap<>();
                s.put("start", calendarData.get("start").toString());
                s.put("end", calendarData.get("end") != null ? calendarData.get("end").toString() : "");
                timeSlots.add(s);
            }

            // Sort timeSlots chronologically across one or more days
            timeSlots.sort((a, b) -> {
                String startA = a.get("start");
                String startB = b.get("start");
                if (startA == null && startB == null) return 0;
                if (startA == null) return -1;
                if (startB == null) return 1;
                String[] patterns = { "MM/dd/yyyy HH:mm:ss", "yyyy-MM-dd HH:mm:ss", "MM/dd/yyyy HH:mm", "yyyy-MM-dd HH:mm" };
                Date dateA = null;
                Date dateB = null;
                for (String p : patterns) {
                    try {
                        SimpleDateFormat sdf = new SimpleDateFormat(p, Locale.ENGLISH);
                        if (dateA == null) dateA = sdf.parse(startA);
                        if (dateB == null) dateB = sdf.parse(startB);
                    } catch (Exception ignored) {}
                }
                if (dateA != null && dateB != null) {
                    return dateA.compareTo(dateB);
                }
                return startA.compareTo(startB);
            });

            JSONObject reqObj = new JSONObject();
            reqObj.put("customerId", cusId);
            reqObj.put("title", title);
            reqObj.put("description", description);
            reqObj.put("calAttendees", calAttendees);
            reqObj.put("calAetId", calAetId);
            reqObj.put("calTimeZone", calTimeZone);
            reqObj.put("memTimeZone", memTimeZone);
            reqObj.put("slotTimeMinus", slotTimeMinus);
            reqObj.put("currentDateYN", currentDateYN);

            JSONArray slotsJson = new JSONArray();
            for (Map<String, String> s : timeSlots) {
                JSONObject slotJson = new JSONObject();
                slotJson.put("start", s.get("start"));
                slotJson.put("end", s.get("end"));
                slotsJson.put(slotJson);
            }
            reqObj.put("timeSlots", slotsJson);

            String encodedReq = Base64.getUrlEncoder()
                    .encodeToString(reqObj.toString().getBytes(StandardCharsets.UTF_8));
            String encodedCusId = Base64.getUrlEncoder()
                    .encodeToString(String.valueOf(cusId).getBytes(StandardCharsets.UTF_8));

            String firstName = customers.getFirstName() != null ? customers.getFirstName() : "";
            String lastName = customers.getLastName() != null ? customers.getLastName() : "";
            String customerName = (firstName + " " + lastName).trim();
            String memEmail = customers.getEmailAddress();
            String googleCalendarEmail = customers.getGoogleCalendarEmail();
            String outlookCalendarEmail = customers.getOutlookCalendarEmail();
            int currentYear = java.time.Year.now().getValue();

            CalendarAppointmentEventType eventType = this.calendarAppointmentEventTypeRepository
                    .findById(Integer.parseInt(calAetId.toString())).orElse(null);
            String eventTitle = eventType != null ? eventType.getTitle() : "Meeting";

            boolean isDirectBooking = calendarData.get("directBooking") != null
                    && ("true".equalsIgnoreCase(calendarData.get("directBooking").toString())
                            || Boolean.TRUE.equals(calendarData.get("directBooking")));

            if (isDirectBooking && timeSlots.size() == 1) {
                Map<String, String> firstSlot = timeSlots.get(0);
                String selectedStart = firstSlot.get("start");
                String selectedEnd = firstSlot.get("end");

                String timeZone = serverDatabaseTimeZone;
                String dbStart = selectedStart;
                String dbEnd = selectedEnd;
                try {
                    if (selectedStart != null && !selectedStart.isEmpty()) {
                        dbStart = this.commonService.dbDateTime(selectedStart);
                    }
                    if (selectedEnd != null && !selectedEnd.isEmpty()) {
                        dbEnd = this.commonService.dbDateTime(selectedEnd);
                    }
                } catch (ParseException e) {
                    e.printStackTrace();
                }

                Date calStartDate = null;
                Date calEndDate = null;
                try {
                    if (dbStart != null && !dbStart.isEmpty()) {
                        calStartDate = this.commonService.convertDate(
                                this.commonService.convertEventTimeZoneToUserDB(dbStart, calTimeZone, timeZone));
                    }
                    if (dbEnd != null && !dbEnd.isEmpty()) {
                        calEndDate = this.commonService.convertDate(
                                this.commonService.convertEventTimeZoneToUserDB(dbEnd, calTimeZone, timeZone));
                    }
                } catch (ParseException e) {
                    e.printStackTrace();
                }

                // Check duplicate bookings
                String slotDate = "";
                try {
                    if (calStartDate != null) {
                        slotDate = this.commonService.dateObjectToDbDate(calStartDate);
                    } else if (dbStart != null && !dbStart.isEmpty()) {
                        slotDate = this.commonService.dbDate(dbStart);
                    }
                } catch (Exception ignored) {
                }

                List<Calendar> existingBookings = new ArrayList<>();
                if (calStartDate != null) {
                    existingBookings = this.calendarRepository.findByCustomerIdAndCalStartDateTime(customers.getId(),
                            calStartDate);
                }
                if (existingBookings == null || existingBookings.isEmpty()) {
                    if (slotDate != null && !slotDate.trim().isEmpty()) {
                        existingBookings = this.calendarRepository.findBookList(customers.getId(), slotDate);
                    } else {
                        existingBookings = Collections.emptyList();
                    }
                }

                Calendar calendar = null;
                for (Calendar existing : existingBookings) {
                    if (existing.getCalStartDateTime() != null && calStartDate != null
                            && (existing.getCalStartDateTime().getTime() == calStartDate.getTime()
                                    || Math.abs(existing.getCalStartDateTime().getTime()
                                            - calStartDate.getTime()) < 1000)) {
                        calendar = existing;
                        break;
                    }
                }

                if (calendar == null) {
                    calendar = new Calendar();
                    calendar.setCalTitle("Meeting with " + title);
                    calendar.setCalDescription(description);
                    calendar.setCustomers(customers);
                    calendar.setCalAllDay("false");
                    calendar.setCalTimeZone(calTimeZone);
                    calendar.setCalAttendees(calAttendees);
                    calendar.setCalAetId(calAetId);
                    calendar.setCalStartDateTime(calStartDate);
                    calendar.setCalEndDateTime(calEndDate);

                    calendar.setCalCreatedDateTime(new Timestamp(System.currentTimeMillis()));
                    calendar.setCalUpdatedDateTime(new Timestamp(System.currentTimeMillis()));
                    calendar.setCalNotification("N");
                    calendar.setCalNumbers("");
                    calendar.setCalType(companyName.toLowerCase().replace(" ", ""));
                    calendar.setCalEventReminder("event");
                    calendar.setCalReminderSubject("");
                    calendar.setCalReminderType("");
                    calendar.setCalMyPageId(0L);
                    calendar.setCalSmsSstId(0L);
                    calendar.setCalScheduleDateTime(new Timestamp(System.currentTimeMillis()));
                    calendar = this.calendarRepository.save(calendar);

                    // Notifications
                    try {
                        String emailNotification = customers.getEmailNotification();
                        if (emailNotification != null && !emailNotification.equals("")) {
                            for (String minutes : emailNotification.split(",")) {
                                CalendarNotification calendarNotification = new CalendarNotification();
                                calendarNotification.setCalendar(calendar);
                                calendarNotification.setMinutes(Long.valueOf(minutes));
                                calendarNotification.setCreatedDate(new Timestamp(System.currentTimeMillis()));
                                calendarNotification.setNotification("N");
                                this.calendarNotificationRepository.save(calendarNotification);
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                String calAtt = calendar.getCalAttendees();
                JSONObject data = new JSONObject(calAtt != null ? calAtt : "{\"attendees\":[]}");
                JSONArray attendees = data.optJSONArray("attendees") != null ? data.getJSONArray("attendees")
                        : new JSONArray();
                String inviteeEmail = attendees.length() > 0
                        ? attendees.get(attendees.length() - 1).toString().toLowerCase()
                        : "";

                String guestsList = "";
                List<String> guestICSList = new ArrayList<>();
                if (!inviteeEmail.isEmpty()) {
                    guestICSList.add(inviteeEmail);
                }
                for (int i = 0; i < attendees.length() - 1; i++) {
                    if (guestsList.equals("")) {
                        guestsList += attendees.get(i).toString().toLowerCase();
                    } else {
                        guestsList += "<br />" + attendees.get(i).toString().toLowerCase();
                    }
                    guestICSList.add(attendees.get(i).toString().toLowerCase());
                }

                // Extract attendee emails as List<String>
                List<String> attendeesList = new ArrayList<>();
                for (int i = 0; i < attendees.length(); i++) {
                    attendeesList.add(attendees.getString(i));
                }

                // Google & Outlook Sync
                List<CalendarDetails> calendarDetailsList = this.calendarDetailsRepository
                        .findCalendarDetailsList(calendar.getId());

                // Google Calendar Sync
                if (customers.getGoogleCalendarRefreshToken() != null
                        && !customers.getGoogleCalendarRefreshToken().isEmpty()) {
                    try {
                        GoogleCalendarDto googleCalendarDto = new GoogleCalendarDto();
                        googleCalendarDto.setCalTitle(calendar.getCalTitle());
                        googleCalendarDto.setCalDescription(
                                calendar.getCalDescription() != null ? calendar.getCalDescription() : "");
                        googleCalendarDto.setCalStartDateTime(selectedStart);
                        googleCalendarDto.setCalEndDateTime(selectedEnd);
                        googleCalendarDto
                                .setCalAllDay(calendar.getCalAllDay() != null ? calendar.getCalAllDay() : "false");
                        googleCalendarDto.setCalTimeZone(calTimeZone);
                        googleCalendarDto.setCalAttendees(attendeesList);
                        googleCalendarDto.setLocation("");

                        String googleSycId = "";
                        CalendarDetails googleCd = null;
                        if (calendarDetailsList != null) {
                            for (CalendarDetails cd : calendarDetailsList) {
                                if ("google".equalsIgnoreCase(cd.getCaldType())) {
                                    googleSycId = cd.getCaldSycId();
                                    googleCd = cd;
                                    break;
                                }
                            }
                        }
                        googleCalendarDto.setCaldSycId(googleSycId != null ? googleSycId : "");
                        Map<String, Object> gRes = this.googleCalendarService.saveEvent(customers.getId(),
                                googleCalendarDto);
                        if (gRes != null && gRes.get("caldSycId") != null
                                && !gRes.get("caldSycId").toString().isEmpty()) {
                            if (googleCd == null) {
                                googleCd = new CalendarDetails();
                                googleCd.setCalendar(calendar);
                                googleCd.setCaldType("google");
                            }
                            googleCd.setCaldSycId(gRes.get("caldSycId").toString());
                            this.calendarDetailsRepository.save(googleCd);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                // Outlook Calendar Sync
                if (customers.getOutlookCalendarRefreshToken() != null
                        && !customers.getOutlookCalendarRefreshToken().isEmpty()) {
                    try {
                        OutlookCalendarDto outlookCalendarDto = new OutlookCalendarDto();
                        outlookCalendarDto.setCalTitle(calendar.getCalTitle());
                        outlookCalendarDto.setCalDescription(
                                calendar.getCalDescription() != null ? calendar.getCalDescription() : "");
                        outlookCalendarDto.setCalStartDateTime(selectedStart);
                        outlookCalendarDto.setCalEndDateTime(selectedEnd);
                        outlookCalendarDto
                                .setCalAllDay(calendar.getCalAllDay() != null ? calendar.getCalAllDay() : "false");
                        outlookCalendarDto.setCalTimeZone(calTimeZone);
                        outlookCalendarDto.setCalAttendees(attendeesList);
                        outlookCalendarDto.setLocation("");

                        String outlookSycId = "";
                        CalendarDetails outlookCd = null;
                        if (calendarDetailsList != null) {
                            for (CalendarDetails cd : calendarDetailsList) {
                                if ("outlook".equalsIgnoreCase(cd.getCaldType())) {
                                    outlookSycId = cd.getCaldSycId();
                                    outlookCd = cd;
                                    break;
                                }
                            }
                        }
                        outlookCalendarDto.setCaldSycId(outlookSycId != null ? outlookSycId : "");
                        Map<String, Object> oRes = this.outlookCalendarService.saveEvent(customers.getId(),
                                outlookCalendarDto);
                        if (oRes != null && oRes.get("caldSycId") != null
                                && !oRes.get("caldSycId").toString().isEmpty()) {
                            if (outlookCd == null) {
                                outlookCd = new CalendarDetails();
                                outlookCd.setCalendar(calendar);
                                outlookCd.setCaldType("outlook");
                            }
                            outlookCd.setCaldSycId(oRes.get("caldSycId").toString());
                            this.calendarDetailsRepository.save(outlookCd);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                // ICS File Code Start
                String icsFileDescription = this.commonService.nl2br(description);
                icsFileDescription += "<br /><br />Guest Email(s) :<br />" + inviteeEmail;
                if (!guestsList.equals("")) {
                    icsFileDescription += "<br />" + guestsList;
                }

                ICSEventDto eventDto = new ICSEventDto();
                eventDto.setReplyToAdd(memEmail);
                eventDto.setStartDate(this.commonService.convertDate(this.commonService
                        .convertEventTimeZoneToUserDB(dbStart, calTimeZone, TimeZone.getDefault().getID())));
                eventDto.setEndDate(
                        this.commonService.convertDate(this.commonService.convertEventTimeZoneToUserDB(dbEnd,
                                calTimeZone, TimeZone.getDefault().getID())));
                eventDto.setSummary(calendar.getCalTitle());
                eventDto.setDescription(this.commonService.br2nl(icsFileDescription));
                eventDto.setAttendees(guestICSList);
                eventDto.setMemberName(this.commonService
                        .ucWords((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")));
                eventDto.setTimeZone(calTimeZone);

                String rootPath = icsDownloadPath + cusId + "/";
                String fileName = "CalendarInvite.ics";
                String filePath = rootPath + fileName;

                String guestsHtml = "";
                if (guestsList != null && !guestsList.trim().isEmpty()) {
                    guestsHtml = "<p><b>Guests:</b></p><p>" + guestsList + "<br /><br /></p>";
                }

                String comment = "";
                if (description != null && !description.trim().isEmpty()) {
                    comment = "<p><b>Kindly see the details of the meeting.</b></p><p>" + description
                            + "<br /><br /></p>";
                }
                int currentYearVal = java.time.Year.now().getValue();

                Integer targetCalId = calendar.getId() != null ? calendar.getId() : 0;
                String encodedTargetCalId = Base64.getUrlEncoder()
                        .encodeToString(String.valueOf(targetCalId).getBytes(StandardCharsets.UTF_8));
                String editAppointmentUrl = siteUrl + "edit-appointment?id=" + encodedTargetCalId + "&v="
                        + encodedCusId;

                final ICSEventDto finalEventDto = eventDto;
                final String finalFilePath = filePath;
                final String finalFileName = fileName;
                final String finalRootPath = rootPath;
                final String finalSiteNameBigCom = siteNameBigCom;
                final String finalMemEmail = memEmail;
                final String finalGoogleCalendarEmail = googleCalendarEmail;
                final String finalOutlookCalendarEmail = outlookCalendarEmail;
                final String finalDbStart = dbStart;
                final String finalCalTimeZone = calTimeZone;
                final String finalMemTimeZone = memTimeZone;
                final String finalFirstName = firstName;
                final String finalLastName = lastName;
                final String finalTitle = title;
                final String finalInviteeEmail = inviteeEmail;
                final String finalGuestsHtml = guestsHtml;
                final String finalComment = comment;
                final CalendarAppointmentEventType finalEventType = eventType;
                final String finalEditAppointmentUrl = editAppointmentUrl;
                final String finalCompanyName = companyName;
                final int finalCurrentYear = currentYearVal;
                final JSONArray finalAttendees = attendees;
                final String finalSiteUrl = siteUrl;

                CompletableFuture.runAsync(() -> {
                    try {
                        File f = new File(finalRootPath);
                        if (!f.exists()) {
                            f.mkdirs();
                        }
                        File myFile = new File(finalFilePath);
                        if (myFile.exists()) {
                            myFile.delete();
                        }
                        ICS.generateICSFile(finalEventDto, finalFilePath, finalSiteNameBigCom);

                        if (finalMemEmail != null && !finalMemEmail.equals("")) {
                            String subject = "New Event Meeting";
                            String body = "<!DOCTYPE html>" +
                                    "<html>" +
                                    "<head>" +
                                    "<meta charset=\"UTF-8\">" +
                                    "<title>New Event Meeting</title>" +
                                    "<style>" +
                                    "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }"
                                    +
                                    ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                                    ".header { text-align: center; padding: 20px 0; border-bottom: 2px solid #eee; }" +
                                    ".logo { max-width: 180px; height: auto; }" +
                                    ".content { padding: 20px 0; }" +
                                    ".footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; text-align: center; }"
                                    +
                                    ".event-detail { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }"
                                    +
                                    "a { color: #44288E !important; text-decoration: none; }" +
                                    "</style>" +
                                    "</head>" +
                                    "<body>" +
                                    "<div class=\"container\">" +
                                    "<div class=\"header\">" +
                                    "<img src=\"" + siteUrl
                                    + "images/logo/360Pipe_logo.png\" alt=\"Site Logo\" class=\"logo\">" +
                                    "</div>" +
                                    "<div class=\"content\">" +
                                    "<p>Hi " + finalFirstName + " " + finalLastName
                                    + ", A new meeting has been scheduled. </p>" +
                                    "<p><b>Event Type:</b></p><p>"
                                    + (finalEventType != null ? finalEventType.getTitle() : "Meeting")
                                    + "<br /><br /></p>" +
                                    "<p><b>Invitee:</b></p><p>" + finalTitle + "<br /><br /></p>" +
                                    "<p><b>Invitee Email:</b></p><p>" + finalInviteeEmail + "<br /><br /></p>" +
                                    finalGuestsHtml +
                                    "<p><b>Invitee Date/Time:</b></p><p>"
                                    + this.commonService.dbDateToDisplayDateTime(finalDbStart)
                                    + "<br /><br /></p>" +
                                    "<p><b>Invitee Timezone:</b></p><p>" + finalCalTimeZone + "<br /><br /></p>" +
                                    "<p><b>Your Date/Time:</b></p><p>"
                                    + this.commonService.dbDateToDisplayDateTime(
                                            this.commonService.convertEventTimeZoneToUserDB(finalDbStart,
                                                    finalCalTimeZone, finalMemTimeZone))
                                    + "<br/>"
                                    + "<a href=\"" + finalEditAppointmentUrl
                                    + "\" target=\"_blank\" style=\"background-color: #44288E; color: #ffffff !important; padding: 7px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-top: 8px;\">Edit Date/Time</a>"
                                    + "<br /><br /></p>" +
                                    "<p><b>Your Timezone:</b></p><p>" + finalMemTimeZone + "<br /><br /></p>" +
                                    finalComment +
                                    "<p>If you have any questions, please contact us at <a href=\"mailto:360pipeinc@gmail.com\">360pipeinc@gmail.com</a>.</p>"
                                    +
                                    "<p>Thank you for your understanding.</p>" +
                                    "<p>The " + finalCompanyName + " Team</p>" +
                                    "</div>" +
                                    "<div class=\"footer\">" +
                                    "<p>&copy; " + finalCurrentYear + " " + finalCompanyName
                                    + ". All rights reserved.</p>" +
                                    "</div>" +
                                    "</div>" +
                                    "</body>" +
                                    "</html>";
                            this.commonService.sendEmail(finalMemEmail, subject, body, true);

                            if (!finalMemEmail.equals(finalGoogleCalendarEmail) && finalGoogleCalendarEmail != null
                                    && !finalGoogleCalendarEmail.equals("")) {
                                this.commonService.sendEmail(finalGoogleCalendarEmail, subject, body, true);
                            }

                            if (!finalMemEmail.equals(finalOutlookCalendarEmail) && finalOutlookCalendarEmail != null
                                    && !finalOutlookCalendarEmail.equals("")) {
                                this.commonService.sendEmail(finalOutlookCalendarEmail, subject, body, true);
                            }
                        }

                        for (int i = 0; i < finalAttendees.length(); i++) {
                            String email = finalAttendees.getString(i);
                            if (!email.equals(finalMemEmail)) {
                                String subject = "New Event Meeting";
                                String body = "<!DOCTYPE html>" +
                                        "<html>" +
                                        "<head>" +
                                        "<meta charset=\"UTF-8\">" +
                                        "<title>New Event Meeting</title>" +
                                        "<style>" +
                                        "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }"
                                        +
                                        ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                                        ".header { text-align: center; padding: 20px 0; border-bottom: 2px solid #eee; }"
                                        +
                                        ".logo { max-width: 180px; height: auto; }" +
                                        ".content { padding: 20px 0; }" +
                                        ".footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; text-align: center; }"
                                        +
                                        ".event-detail { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }"
                                        +
                                        "a { color: #44288E !important; text-decoration: none; }" +
                                        "</style>" +
                                        "</head>" +
                                        "<body>" +
                                        "<div class=\"container\">" +
                                        "<div class=\"header\">" +
                                        "<img src=\"" + siteUrl
                                        + "images/logo/360Pipe_logo.png\" alt=\"Site Logo\" class=\"logo\">" +
                                        "</div>" +
                                        "<div class=\"content\">" +
                                        "<p>Hi " + (finalTitle != null && !finalTitle.isEmpty() ? finalTitle : "there")
                                        + ", Your "
                                        + (finalEventType != null ? finalEventType.getTitle() : "Meeting") + " with "
                                        + finalFirstName + " "
                                        + finalLastName + " at "
                                        + this.commonService.dbDateToDisplayDateTime(finalDbStart) + " "
                                        + finalCalTimeZone + " is scheduled. </p>" +
                                        "<p><a href=\"" + finalEditAppointmentUrl
                                        + "\" target=\"_blank\" style=\"background-color: #44288E; color: #ffffff !important; padding: 7px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-top: 6px;\">Edit Date/Time</a></p>"
                                        +
                                        finalComment +
                                        finalGuestsHtml +
                                        "<p>If you have any questions, please contact us at <a href=\"mailto:360pipeinc@gmail.com\">360pipeinc@gmail.com</a>.</p>"
                                        +
                                        "<p>Thank you for your understanding.</p>" +
                                        "<p>The " + finalCompanyName + " Team</p>" +
                                        "</div>" +
                                        "<div class=\"footer\">" +
                                        "<p>&copy; " + finalCurrentYear + " " + finalCompanyName
                                        + ". All rights reserved.</p>" +
                                        "</div>" +
                                        "</div>" +
                                        "</body>" +
                                        "</html>";
                                this.commonService.sendEmailWithAttachment(email, subject, body, true, finalFileName,
                                        finalFilePath);
                            }
                        }
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                });

                Map<String, Object> result = new HashMap<>();
                result.put("id", calendar.getId());
                result.put("title", eventType != null ? eventType.getTitle() : calendar.getCalTitle());
                result.put("start", selectedStart);
                result.put("end", selectedEnd);
                result.put("calTimeZone", calTimeZone);
                result.put("customerId", cusId);
                resBody.put("result", result);
                resBody.put("message", "Meeting scheduled directly.");
                return resBody;
            }

            StringBuilder slotsHtml = new StringBuilder();
            slotsHtml.append("<div style=\"margin: 20px 0;\">");
            for (int i = 0; i < timeSlots.size(); i++) {
                Map<String, String> slot = timeSlots.get(i);
                String rawStart = slot.get("start");
                String rawEnd = slot.get("end");
                String displaySlotText = (rawStart != null ? rawStart : "") + " - " + (rawEnd != null ? rawEnd : "");
                try {
                    Date sDate = null;
                    Date eDate = null;
                    String[] patterns = { "MM/dd/yyyy HH:mm:ss", "yyyy-MM-dd HH:mm:ss", "MM/dd/yyyy HH:mm",
                            "yyyy-MM-dd HH:mm" };
                    for (String pattern : patterns) {
                        try {
                            SimpleDateFormat sdf = new SimpleDateFormat(pattern, Locale.ENGLISH);
                            if (sDate == null)
                                sDate = sdf.parse(rawStart);
                            if (eDate == null)
                                eDate = sdf.parse(rawEnd);
                        } catch (Exception ignored) {
                        }
                    }
                    if (sDate != null && eDate != null) {
                        SimpleDateFormat dateFmt = new SimpleDateFormat("MM/dd/yyyy", Locale.ENGLISH);
                        SimpleDateFormat timeFmt = new SimpleDateFormat("hh:mm a", Locale.ENGLISH);
                        String sDateStr = dateFmt.format(sDate);
                        String eDateStr = dateFmt.format(eDate);
                        if (sDateStr.equals(eDateStr)) {
                            displaySlotText = sDateStr + " " + timeFmt.format(sDate) + " - " + timeFmt.format(eDate);
                        } else {
                            displaySlotText = sDateStr + " " + timeFmt.format(sDate) + " - " + eDateStr + " "
                                    + timeFmt.format(eDate);
                        }
                    }
                } catch (Exception ignored) {
                }

                String encodedSlotId = Base64.getUrlEncoder()
                        .encodeToString(String.valueOf(i).getBytes(StandardCharsets.UTF_8));
                String acceptUrl = siteUrl + "set-appointment?v=" + encodedCusId + "&status=accept&timeSlotId="
                        + encodedSlotId + "&req=" + URLEncoder.encode(encodedReq, StandardCharsets.UTF_8.toString());

                slotsHtml.append(
                        "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; width: 100%; border-collapse: separate;\">")
                        .append("<tr>")
                        .append("<td style=\"padding: 14px 16px; text-align: left; vertical-align: middle;\">")
                        .append("<div style=\"font-size: 14px; font-weight: bold; color: #1e293b;\">")
                        .append(displaySlotText).append("</div>")
                        .append("<div style=\"font-size: 12px; color: #64748b; margin-top: 4px;\">Timezone: ")
                        .append(calTimeZone)
                        .append("</div>")
                        .append("</td>")
                        .append("<td style=\"padding: 14px 16px; text-align: right; vertical-align: middle; width: 100px; white-space: nowrap;\">")
                        .append("<a href=\"").append(acceptUrl)
                        .append("\" target=\"_blank\" style=\"background-color: #16a34a; color: #ffffff !important; padding: 9px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;\">Accept</a>")
                        .append("</td>")
                        .append("</tr>")
                        .append("</table>");
            }
            slotsHtml.append("</div>");

            String rejectUrl = siteUrl + "set-appointment?v=" + encodedCusId + "&status=reject&req="
                    + URLEncoder.encode(encodedReq, StandardCharsets.UTF_8.toString());

            String guestsInfo = "";
            try {
                JSONObject data = new JSONObject(calAttendees);
                JSONArray attendees = data.optJSONArray("attendees");
                if (attendees != null && attendees.length() > 0) {
                    List<String> gList = new ArrayList<>();
                    for (int i = 0; i < attendees.length(); i++) {
                        gList.add(attendees.getString(i));
                    }
                    guestsInfo = "<p><b>Attendee(s):</b> " + String.join(", ", gList) + "</p>";
                }
            } catch (Exception ignored) {
            }

            String notesInfo = "";
            if (!description.trim().isEmpty()) {
                notesInfo = "<p><b>Notes from Invitee:</b></p><p style=\"background:#f9f9f9; padding:10px; border-radius:6px;\">"
                        + description + "</p>";
            }

            String subject = "New Meeting Request.";
            String emailBody = "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    "<meta charset=\"UTF-8\">" +
                    "<title>New Meeting Request</title>" +
                    "<style>" +
                    "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }" +
                    ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                    ".header { text-align: center; padding: 20px 0; border-bottom: 2px solid #eee; }" +
                    ".logo { max-width: 180px; height: auto; }" +
                    ".content { padding: 20px 0; }" +
                    ".footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; text-align: center; }"
                    +
                    "a { color: #44288E !important; text-decoration: none; }" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<div class=\"container\">" +
                    "<div class=\"header\">" +
                    "<img src=\"" + siteUrl + "images/logo/360Pipe_logo.png\" alt=\"Site Logo\" class=\"logo\">" +
                    "</div>" +
                    "<div class=\"content\">" +
                    "<p>Dear " + customerName + ",</p>" +
                    "<p>This email confirms that a new meeting request has been received and is pending your approval.</p>"
                    +
                    "<p><b>Meeting Type:</b> " + eventTitle + "</p>" +
                    "<p><b>Invitee:</b> " + title + "</p>" +
                    guestsInfo +
                    notesInfo +
                    "<p style=\"margin-top: 20px; font-weight: bold;\">Please choose and accept one of the requested time slots below:</p>"
                    +
                    slotsHtml.toString() +
                    "<p>Once you approve this request, the meeting will be added to your calendar.</p>" +
                    "<p>To reject this appointment request, please click on the link below:</p>" +
                    "<div style=\"text-align: center; margin: 25px 0;\">" +
                    "<a href=\"" + rejectUrl
                    + "\" target=\"_blank\" style=\"background-color: #ef4444; color: #ffffff !important; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;\">Reject Meeting Request</a>"
                    +
                    "</div>" +
                    "<p>Thank you for your time. We look forward to assisting you!</p>" +
                    "<p>Best regards,<br />The " + companyName + " Team</p>" +
                    "</div>" +
                    "<div class=\"footer\">" +
                    "<p>&copy; " + currentYear + " " + companyName + ". All rights reserved.</p>" +
                    "</div>" +
                    "</div>" +
                    "</body>" +
                    "</html>";

            String customerEmail = customers.getEmailAddress() != null && !customers.getEmailAddress().isEmpty()
                    ? customers.getEmailAddress()
                    : customers.getEmailAddress();

            if (customerEmail != null && !customerEmail.isEmpty()) {
                final String finalSubject = subject;
                final String finalEmailBody = emailBody;
                final String finalCustomerEmail = customerEmail;
                CompletableFuture.runAsync(() -> {
                    try {
                        this.commonService.sendEmail(finalCustomerEmail, finalSubject, finalEmailBody, true);
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                });
            }

            resBody.put("message", "Meeting request sent successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            resBody.put("error", "Failed to process meeting request: " + e.getMessage());
        }
        return resBody;
    }

    @Override
    public Map<String, Object> setAcceptOrRejectAppointment(Map<String, Object> payload) {
        Map<String, Object> resBody = new HashMap<>();
        resBody.put("error", "");
        try {
            String v = payload.get("v") != null ? payload.get("v").toString() : "";
            String status = payload.get("status") != null ? payload.get("status").toString() : "accept";
            String timeSlotId = payload.get("timeSlotId") != null ? payload.get("timeSlotId").toString() : "";
            String reqStr = payload.get("req") != null ? payload.get("req").toString() : "";

            Integer cusId = null;
            if (!v.isEmpty()) {
                try {
                    String decodedCusIdStr = new String(Base64.getUrlDecoder().decode(v), StandardCharsets.UTF_8);
                    cusId = Integer.parseInt(decodedCusIdStr);
                } catch (Exception ex) {
                    try {
                        String decodedCusIdStr = new String(Base64.getDecoder().decode(v), StandardCharsets.UTF_8);
                        cusId = Integer.parseInt(decodedCusIdStr);
                    } catch (Exception e2) {
                        cusId = Integer.parseInt(v);
                    }
                }
            }

            JSONObject reqObj = null;
            if (!reqStr.isEmpty()) {
                try {
                    String decodedReq = new String(Base64.getUrlDecoder().decode(reqStr), StandardCharsets.UTF_8);
                    reqObj = new JSONObject(decodedReq);
                } catch (Exception ex) {
                    try {
                        String decodedReq = new String(Base64.getDecoder().decode(reqStr), StandardCharsets.UTF_8);
                        reqObj = new JSONObject(decodedReq);
                    } catch (Exception ignored) {
                    }
                }
            }

            if (cusId == null && reqObj != null && reqObj.has("customerId")) {
                cusId = reqObj.getInt("customerId");
            }

            if (cusId == null) {
                resBody.put("error", "Invalid customer parameter.");
                return resBody;
            }

            Customers customers = this.customersRepository.findById(cusId)
                    .orElseThrow(() -> new RuntimeException("Customer not found!"));

            if ("reject".equalsIgnoreCase(status)) {
                String title = reqObj != null && reqObj.has("title") ? reqObj.getString("title") : "";
                String description = reqObj != null && reqObj.has("description") ? reqObj.getString("description") : "";
                String calAttendees = reqObj != null && reqObj.has("calAttendees") ? reqObj.getString("calAttendees")
                        : "{\"attendees\":[]}";
                Long calAetId = reqObj != null && reqObj.has("calAetId") ? reqObj.getLong("calAetId") : 0L;

                CalendarAppointmentEventType eventType = null;
                if (calAetId != null && calAetId > 0) {
                    eventType = this.calendarAppointmentEventTypeRepository
                            .findById(Integer.parseInt(calAetId.toString())).orElse(null);
                }
                String eventTitle = eventType != null ? eventType.getTitle() : "Meeting";

                String hostFirstName = customers.getFirstName() != null ? customers.getFirstName() : "";
                String hostLastName = customers.getLastName() != null ? customers.getLastName() : "";
                String hostName = (hostFirstName + " " + hostLastName).trim();
                if (hostName.isEmpty()) {
                    hostName = companyName;
                }

                List<String> attendeeEmails = new ArrayList<>();
                try {
                    JSONObject attData = new JSONObject(calAttendees);
                    JSONArray attendeesArray = attData.optJSONArray("attendees");
                    if (attendeesArray != null) {
                        for (int i = 0; i < attendeesArray.length(); i++) {
                            String email = attendeesArray.optString(i, "").trim();
                            if (!email.isEmpty() && !attendeeEmails.contains(email)) {
                                attendeeEmails.add(email);
                            }
                        }
                    }
                } catch (Exception ignored) {
                }
                attendeeEmails.add(customers.getEmailAddress());
                int currentYear = java.time.Year.now().getValue();
                String subject = "Meeting Request Declined - " + eventTitle;
                String body = "<!DOCTYPE html>" +
                        "<html>" +
                        "<head>" +
                        "<meta charset=\"UTF-8\">" +
                        "<title>Meeting Request Declined</title>" +
                        "<style>" +
                        "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }"
                        +
                        ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                        ".header { text-align: center; padding: 20px 0; border-bottom: 2px solid #eee; }" +
                        ".logo { max-width: 180px; height: auto; }" +
                        ".content { padding: 20px 0; }" +
                        ".footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; text-align: center; }"
                        +
                        ".badge { display: inline-block; background-color: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 13px; margin-bottom: 12px; }"
                        +
                        "a { color: #44288E !important; text-decoration: none; }" +
                        "</style>" +
                        "</head>" +
                        "<body>" +
                        "<div class=\"container\">" +
                        "<div class=\"header\">" +
                        "<img src=\"" + siteUrl + "images/logo/360Pipe_logo.png\" alt=\"Site Logo\" class=\"logo\">" +
                        "</div>" +
                        "<div class=\"content\">" +
                        "<span class=\"badge\">Declined</span>" +
                        "<p>Hi " + (title != null && !title.isEmpty() ? title : "there") + ",</p>" +
                        "<p>Thank you for your interest in scheduling a meeting. We regret to inform you that your request for <b>"
                        + eventTitle + "</b> with <b>" + hostName + "</b> could not be accepted at this time.</p>" +
                        "<p>None of the requested time slots could be scheduled. Please feel free to check our calendar again for other available times or contact us directly.</p>"
                        +
                        "<p>If you have any questions, please contact us at <a href=\"mailto:360pipeinc@gmail.com\">360pipeinc@gmail.com</a>.</p>"
                        +
                        "<p>Thank you for your understanding.</p>" +
                        "<p>Best regards,<br />The " + companyName + " Team</p>" +
                        "</div>" +
                        "<div class=\"footer\">" +
                        "<p>&copy; " + currentYear + " " + companyName + ". All rights reserved.</p>" +
                        "</div>" +
                        "</div>" +
                        "</body>" +
                        "</html>";

                final String finalSubject = subject;
                final String finalBody = body;
                final List<String> finalAttendeeEmails = new ArrayList<>(attendeeEmails);

                CompletableFuture.runAsync(() -> {
                    try {
                        for (String email : finalAttendeeEmails) {
                            this.commonService.sendEmail(email, finalSubject, finalBody, true);
                        }
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                });

                Map<String, Object> result = new HashMap<>();
                result.put("status", "rejected");
                result.put("message", "Meeting request rejected and notification email sent to attendees.");
                resBody.put("result", result);
                return resBody;
            }

            // Accept Flow
            String title = reqObj != null && reqObj.has("title") ? reqObj.getString("title") : "";
            String description = reqObj != null && reqObj.has("description") ? reqObj.getString("description") : "";
            String calAttendees = reqObj != null && reqObj.has("calAttendees") ? reqObj.getString("calAttendees")
                    : "{\"attendees\":[]}";
            Long calAetId = reqObj != null && reqObj.has("calAetId") ? reqObj.getLong("calAetId") : 0L;
            String calTimeZone = reqObj != null && reqObj.has("calTimeZone") ? reqObj.getString("calTimeZone") : "";
            String memTimeZone = reqObj != null && reqObj.has("memTimeZone") ? reqObj.getString("memTimeZone") : "";

            String selectedStart = "";
            String selectedEnd = "";

            if (reqObj != null && reqObj.has("timeSlots")) {
                JSONArray slotsArray = reqObj.getJSONArray("timeSlots");
                int slotIndex = 0;
                if (!timeSlotId.isEmpty()) {
                    try {
                        String decodedIndex = new String(Base64.getUrlDecoder().decode(timeSlotId),
                                StandardCharsets.UTF_8);
                        slotIndex = Integer.parseInt(decodedIndex);
                    } catch (Exception e) {
                        try {
                            String decodedIndex = new String(Base64.getDecoder().decode(timeSlotId),
                                    StandardCharsets.UTF_8);
                            slotIndex = Integer.parseInt(decodedIndex);
                        } catch (Exception e2) {
                            try {
                                slotIndex = Integer.parseInt(timeSlotId);
                            } catch (Exception ignored) {
                            }
                        }
                    }
                }
                if (slotIndex >= 0 && slotIndex < slotsArray.length()) {
                    JSONObject chosenSlot = slotsArray.getJSONObject(slotIndex);
                    selectedStart = chosenSlot.optString("start");
                    selectedEnd = chosenSlot.optString("end");
                }
            }

            if (selectedStart.isEmpty() && payload.get("start") != null) {
                selectedStart = payload.get("start").toString();
                selectedEnd = payload.get("end") != null ? payload.get("end").toString() : "";
            }

            String timeZone = serverDatabaseTimeZone;
            String dbStart = selectedStart;
            String dbEnd = selectedEnd;
            try {
                if (selectedStart != null && !selectedStart.isEmpty()) {
                    dbStart = this.commonService.dbDateTime(selectedStart);
                }
                if (selectedEnd != null && !selectedEnd.isEmpty()) {
                    dbEnd = this.commonService.dbDateTime(selectedEnd);
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }

            Date calStartDate = null;
            Date calEndDate = null;
            try {
                if (dbStart != null && !dbStart.isEmpty()) {
                    calStartDate = this.commonService.convertDate(
                            this.commonService.convertEventTimeZoneToUserDB(dbStart, calTimeZone, timeZone));
                }
                if (dbEnd != null && !dbEnd.isEmpty()) {
                    calEndDate = this.commonService.convertDate(
                            this.commonService.convertEventTimeZoneToUserDB(dbEnd, calTimeZone, timeZone));
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }

            CalendarAppointmentEventType eventType = this.calendarAppointmentEventTypeRepository
                    .findById(Integer.parseInt(calAetId.toString())).orElse(null);

            // Check if meeting already booked on calendar for this customer and slot to
            // prevent duplicate entries
            String slotDate = "";
            try {
                if (calStartDate != null) {
                    slotDate = this.commonService.dateObjectToDbDate(calStartDate);
                } else if (dbStart != null && !dbStart.isEmpty()) {
                    slotDate = this.commonService.dbDate(dbStart);
                }
            } catch (Exception ignored) {
            }

            List<Calendar> existingBookings = new ArrayList<>();
            if (calStartDate != null) {
                existingBookings = this.calendarRepository.findByCustomerIdAndCalStartDateTime(customers.getId(),
                        calStartDate);
            }
            if (existingBookings == null || existingBookings.isEmpty()) {
                if (slotDate != null && !slotDate.trim().isEmpty()) {
                    existingBookings = this.calendarRepository.findBookList(customers.getId(), slotDate);
                } else {
                    existingBookings = Collections.emptyList();
                }
            }

            for (Calendar existing : existingBookings) {
                if (existing.getCalStartDateTime() != null && calStartDate != null
                        && (existing.getCalStartDateTime().getTime() == calStartDate.getTime()
                                || Math.abs(
                                        existing.getCalStartDateTime().getTime() - calStartDate.getTime()) < 1000)) {
                    JSONObject existingAttData = new JSONObject(
                            existing.getCalAttendees() != null ? existing.getCalAttendees() : "{\"attendees\":[]}");
                    JSONArray existingAttendees = existingAttData.optJSONArray("attendees") != null
                            ? existingAttData.getJSONArray("attendees")
                            : new JSONArray();
                    String existingInviteeEmail = existingAttendees.length() > 0
                            ? existingAttendees.get(existingAttendees.length() - 1).toString().toLowerCase()
                            : "";

                    Map<String, Object> result = new HashMap<>();
                    result.put("title", eventType != null ? eventType.getTitle() : existing.getCalTitle());
                    result.put("start", selectedStart);
                    result.put("end", selectedEnd);
                    result.put("calTimeZone", calTimeZone);
                    result.put("invitee", title);
                    result.put("inviteeEmail", existingInviteeEmail);
                    result.put("description", description);
                    resBody.put("result", result);
                    resBody.put("error", "Slot Already Booked For This Meeting. Please Select Another Free Slot.");
                    return resBody;
                }
            }

            // Create Calendar Record
            Calendar calendar = new Calendar();
            calendar.setCalTitle("Meeting with " + title);
            calendar.setCalDescription(description);
            calendar.setCustomers(customers);
            calendar.setCalAllDay("false");
            calendar.setCalTimeZone(calTimeZone);
            calendar.setCalAttendees(calAttendees);
            calendar.setCalAetId(calAetId);
            calendar.setCalStartDateTime(calStartDate);
            calendar.setCalEndDateTime(calEndDate);

            calendar.setCalCreatedDateTime(new Timestamp(System.currentTimeMillis()));
            calendar.setCalUpdatedDateTime(new Timestamp(System.currentTimeMillis()));
            calendar.setCalNotification("N");
            calendar.setCalNumbers("");
            calendar.setCalType(companyName.toLowerCase().replace(" ", ""));
            calendar.setCalEventReminder("event");
            calendar.setCalReminderSubject("");
            calendar.setCalReminderType("");
            calendar.setCalMyPageId(0L);
            calendar.setCalSmsSstId(0L);
            calendar.setCalScheduleDateTime(new Timestamp(System.currentTimeMillis()));
            calendar = calendarRepository.save(calendar);

            // Member notification start
            try {
                String emailNotification = customers.getEmailNotification();
                if (emailNotification != null && !emailNotification.equals("")) {
                    for (String minutes : emailNotification.split(",")) {
                        CalendarNotification calendarNotification = new CalendarNotification();
                        calendarNotification.setCalendar(calendar);
                        calendarNotification.setMinutes(Long.valueOf(minutes));
                        calendarNotification.setCreatedDate(new Timestamp(System.currentTimeMillis()));
                        calendarNotification.setNotification("N");
                        this.calendarNotificationRepository.save(calendarNotification);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            // Member notification end

            String calAtt = calendar.getCalAttendees();
            JSONObject data = new JSONObject(calAtt);
            JSONArray attendees = data.optJSONArray("attendees") != null ? data.getJSONArray("attendees")
                    : new JSONArray();
            String inviteeEmail = attendees.length() > 0
                    ? attendees.get(attendees.length() - 1).toString().toLowerCase()
                    : "";

            String guestsList = "";
            List<String> guestICSList = new ArrayList<>();
            if (!inviteeEmail.isEmpty()) {
                guestICSList.add(inviteeEmail);
            }
            for (int i = 0; i < attendees.length() - 1; i++) {
                if (guestsList.equals("")) {
                    guestsList += attendees.get(i).toString().toLowerCase();
                } else {
                    guestsList += "<br />" + attendees.get(i).toString().toLowerCase();
                }
                guestICSList.add(attendees.get(i).toString().toLowerCase());
            }

            String rootPath = icsDownloadPath + cusId + "/";
            String fileName = "CalendarInvite.ics";
            String filePath = rootPath + fileName;
            String guestsHtml = "";
            if (guestsList != null && !guestsList.trim().isEmpty()) {
                guestsHtml = "<p><b>Guests:</b></p><p>" + guestsList + "<br /><br /></p>";
            }

            String comment = "";
            if (description != null && !description.trim().isEmpty()) {
                comment = "<p><b>Kindly see the details of the meeting.</b></p><p>" + description + "<br /><br /></p>";
            }
            int currentYear = java.time.Year.now().getValue();
            if (eventType == null && calAetId != null) {
                try {
                    eventType = this.calendarAppointmentEventTypeRepository
                            .findById(Integer.parseInt(calAetId.toString())).orElse(null);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
            String encodedCusId = Base64.getUrlEncoder()
                    .encodeToString(String.valueOf(customers.getId()).getBytes(StandardCharsets.UTF_8));
            Integer targetCalId = calendar.getId() != null ? calendar.getId() : 0;
            String encodedTargetCalId = Base64.getUrlEncoder()
                    .encodeToString(String.valueOf(targetCalId).getBytes(StandardCharsets.UTF_8));
            String editAppointmentUrl = siteUrl + "edit-appointment?id=" + encodedTargetCalId + "&v=" + encodedCusId;

            String memEmail = customers.getEmailAddress();
            String firstName = customers.getFirstName();
            String lastName = customers.getLastName();
            String googleCalendarEmail = customers.getGoogleCalendarEmail();
            String outlookCalendarEmail = customers.getOutlookCalendarEmail();

            // Extract attendee emails as List<String>
            List<String> attendeesList = new ArrayList<>();
            for (int i = 0; i < attendees.length(); i++) {
                attendeesList.add(attendees.getString(i));
            }

            // Google & Outlook Sync
            List<CalendarDetails> calendarDetailsList = this.calendarDetailsRepository
                    .findCalendarDetailsList(calendar.getId());

            // Google Calendar Sync
            if (customers.getGoogleCalendarRefreshToken() != null
                    && !customers.getGoogleCalendarRefreshToken().isEmpty()) {
                try {
                    GoogleCalendarDto googleCalendarDto = new GoogleCalendarDto();
                    googleCalendarDto.setCalTitle(calendar.getCalTitle());
                    googleCalendarDto.setCalDescription(
                            calendar.getCalDescription() != null ? calendar.getCalDescription() : "");
                    googleCalendarDto.setCalStartDateTime(selectedStart);
                    googleCalendarDto.setCalEndDateTime(selectedEnd);
                    googleCalendarDto.setCalAllDay(calendar.getCalAllDay() != null ? calendar.getCalAllDay() : "false");
                    googleCalendarDto.setCalTimeZone(calTimeZone);
                    googleCalendarDto.setCalAttendees(attendeesList);
                    googleCalendarDto.setLocation("");

                    String googleSycId = "";
                    CalendarDetails googleCd = null;
                    if (calendarDetailsList != null) {
                        for (CalendarDetails cd : calendarDetailsList) {
                            if ("google".equalsIgnoreCase(cd.getCaldType())) {
                                googleSycId = cd.getCaldSycId();
                                googleCd = cd;
                                break;
                            }
                        }
                    }
                    googleCalendarDto.setCaldSycId(googleSycId != null ? googleSycId : "");
                    Map<String, Object> gRes = this.googleCalendarService.saveEvent(customers.getId(),
                            googleCalendarDto);
                    if (gRes != null && gRes.get("caldSycId") != null && !gRes.get("caldSycId").toString().isEmpty()) {
                        if (googleCd == null) {
                            googleCd = new CalendarDetails();
                            googleCd.setCalendar(calendar);
                            googleCd.setCaldType("google");
                        }
                        googleCd.setCaldSycId(gRes.get("caldSycId").toString());
                        this.calendarDetailsRepository.save(googleCd);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            // Outlook Calendar Sync
            if (customers.getOutlookCalendarRefreshToken() != null
                    && !customers.getOutlookCalendarRefreshToken().isEmpty()) {
                try {
                    OutlookCalendarDto outlookCalendarDto = new OutlookCalendarDto();
                    outlookCalendarDto.setCalTitle(calendar.getCalTitle());
                    outlookCalendarDto.setCalDescription(
                            calendar.getCalDescription() != null ? calendar.getCalDescription() : "");
                    outlookCalendarDto.setCalStartDateTime(selectedStart);
                    outlookCalendarDto.setCalEndDateTime(selectedEnd);
                    outlookCalendarDto
                            .setCalAllDay(calendar.getCalAllDay() != null ? calendar.getCalAllDay() : "false");
                    outlookCalendarDto.setCalTimeZone(calTimeZone);
                    outlookCalendarDto.setCalAttendees(attendeesList);
                    outlookCalendarDto.setLocation("");

                    String outlookSycId = "";
                    CalendarDetails outlookCd = null;
                    if (calendarDetailsList != null) {
                        for (CalendarDetails cd : calendarDetailsList) {
                            if ("outlook".equalsIgnoreCase(cd.getCaldType())) {
                                outlookSycId = cd.getCaldSycId();
                                outlookCd = cd;
                                break;
                            }
                        }
                    }
                    outlookCalendarDto.setCaldSycId(outlookSycId != null ? outlookSycId : "");
                    Map<String, Object> oRes = this.outlookCalendarService.saveEvent(customers.getId(),
                            outlookCalendarDto);
                    if (oRes != null && oRes.get("caldSycId") != null && !oRes.get("caldSycId").toString().isEmpty()) {
                        if (outlookCd == null) {
                            outlookCd = new CalendarDetails();
                            outlookCd.setCalendar(calendar);
                            outlookCd.setCaldType("outlook");
                        }
                        outlookCd.setCaldSycId(oRes.get("caldSycId").toString());
                        this.calendarDetailsRepository.save(outlookCd);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            // ICS File Code Start
            String icsFileDescription = this.commonService.nl2br(description);
            icsFileDescription += "<br /><br />Guest Email(s) :<br />" + inviteeEmail;
            if (!guestsList.equals("")) {
                icsFileDescription += "<br />" + guestsList;
            }

            ICSEventDto eventDto = new ICSEventDto();
            eventDto.setReplyToAdd(memEmail);
            eventDto.setStartDate(this.commonService.convertDate(this.commonService
                    .convertEventTimeZoneToUserDB(dbStart, calTimeZone, TimeZone.getDefault().getID())));
            eventDto.setEndDate(this.commonService.convertDate(this.commonService.convertEventTimeZoneToUserDB(dbEnd,
                    calTimeZone, TimeZone.getDefault().getID())));
            eventDto.setSummary(calendar.getCalTitle());
            eventDto.setDescription(this.commonService.br2nl(icsFileDescription));
            eventDto.setAttendees(guestICSList);
            eventDto.setMemberName(this.commonService
                    .ucWords((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")));
            eventDto.setTimeZone(calTimeZone);
            final ICSEventDto finalEventDto = eventDto;
            final String finalFilePath = filePath;
            final String finalFileName = fileName;
            final String finalRootPath = rootPath;
            final String finalSiteNameBigCom = siteNameBigCom;
            final String finalMemEmail = memEmail;
            final String finalGoogleCalendarEmail = googleCalendarEmail;
            final String finalOutlookCalendarEmail = outlookCalendarEmail;
            final String finalDbStart = dbStart;
            final String finalCalTimeZone = calTimeZone;
            final String finalMemTimeZone = memTimeZone;
            final String finalFirstName = firstName;
            final String finalLastName = lastName;
            final String finalTitle = title;
            final String finalInviteeEmail = inviteeEmail;
            final String finalGuestsHtml = guestsHtml;
            final String finalComment = comment;
            final CalendarAppointmentEventType finalEventType = eventType;
            final String finalEditAppointmentUrl = editAppointmentUrl;
            final String finalCompanyName = companyName;
            final int finalCurrentYear = currentYear;
            final JSONArray finalAttendees = attendees;
            final String finalSiteUrl = siteUrl;

            CompletableFuture.runAsync(() -> {
                try {
                    File f = new File(finalRootPath);
                    if (!f.exists()) {
                        f.mkdirs();
                    }
                    File myFile = new File(finalFilePath);
                    if (myFile.exists()) {
                        myFile.delete();
                    }
                    ICS.generateICSFile(finalEventDto, finalFilePath, finalSiteNameBigCom);

                    if (finalMemEmail != null && !finalMemEmail.equals("")) {
                        String subject = "New Event Meeting";
                        String body = "<!DOCTYPE html>" +
                                "<html>" +
                                "<head>" +
                                "<meta charset=\"UTF-8\">" +
                                "<title>New Event Meeting</title>" +
                                "<style>" +
                                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }"
                                +
                                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                                ".header { text-align: center; padding: 20px 0; border-bottom: 2px solid #eee; }" +
                                ".logo { max-width: 180px; height: auto; }" +
                                ".content { padding: 20px 0; }" +
                                ".footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; text-align: center; }"
                                +
                                ".event-detail { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }"
                                +
                                "a { color: #44288E !important; text-decoration: none; }" +
                                "</style>" +
                                "</head>" +
                                "<body>" +
                                "<div class=\"container\">" +
                                "<div class=\"header\">" +
                                "<img src=\"" + siteUrl
                                + "images/logo/360Pipe_logo.png\" alt=\"Site Logo\" class=\"logo\">" +
                                "</div>" +
                                "<div class=\"content\">" +
                                "<p>Hi " + finalFirstName + " " + finalLastName
                                + ", A new meeting has been scheduled. </p>" +
                                "<p><b>Event Type:</b></p><p>"
                                + (finalEventType != null ? finalEventType.getTitle() : "Meeting")
                                + "<br /><br /></p>" +
                                "<p><b>Invitee:</b></p><p>" + finalTitle + "<br /><br /></p>" +
                                "<p><b>Invitee Email:</b></p><p>" + finalInviteeEmail + "<br /><br /></p>" +
                                finalGuestsHtml +
                                "<p><b>Invitee Date/Time:</b></p><p>"
                                + this.commonService.dbDateToDisplayDateTime(finalDbStart)
                                + "<br /><br /></p>" +
                                "<p><b>Invitee Timezone:</b></p><p>" + finalCalTimeZone + "<br /><br /></p>" +
                                "<p><b>Your Date/Time:</b></p><p>"
                                + this.commonService.dbDateToDisplayDateTime(
                                        this.commonService.convertEventTimeZoneToUserDB(finalDbStart, finalCalTimeZone,
                                                finalMemTimeZone))
                                + "<br/>"
                                + "<a href=\"" + finalEditAppointmentUrl
                                + "\" target=\"_blank\" style=\"background-color: #44288E; color: #ffffff !important; padding: 7px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-top: 8px;\">Edit Date/Time</a>"
                                + "<br /><br /></p>" +
                                "<p><b>Your Timezone:</b></p><p>" + finalMemTimeZone + "<br /><br /></p>" +
                                finalComment +
                                "<p>If you have any questions, please contact us at <a href=\"mailto:360pipeinc@gmail.com\">360pipeinc@gmail.com</a>.</p>"
                                +
                                "<p>Thank you for your understanding.</p>" +
                                "<p>The " + finalCompanyName + " Team</p>" +
                                "</div>" +
                                "<div class=\"footer\">" +
                                "<p>&copy; " + finalCurrentYear + " " + finalCompanyName + ". All rights reserved.</p>"
                                +
                                "</div>" +
                                "</div>" +
                                "</body>" +
                                "</html>";
                        this.commonService.sendEmail(finalMemEmail, subject, body, true);

                        if (!finalMemEmail.equals(finalGoogleCalendarEmail) && finalGoogleCalendarEmail != null
                                && !finalGoogleCalendarEmail.equals("")) {
                            this.commonService.sendEmail(finalGoogleCalendarEmail, subject, body, true);
                        }

                        if (!finalMemEmail.equals(finalOutlookCalendarEmail) && finalOutlookCalendarEmail != null
                                && !finalOutlookCalendarEmail.equals("")) {
                            this.commonService.sendEmail(finalOutlookCalendarEmail, subject, body, true);
                        }
                    }

                    for (int i = 0; i < finalAttendees.length(); i++) {
                        String email = finalAttendees.getString(i);
                        if (!email.equals(finalMemEmail)) {
                            String subject = "New Event Meeting";
                            String body = "<!DOCTYPE html>" +
                                    "<html>" +
                                    "<head>" +
                                    "<meta charset=\"UTF-8\">" +
                                    "<title>New Event Meeting</title>" +
                                    "<style>" +
                                    "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }"
                                    +
                                    ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                                    ".header { text-align: center; padding: 20px 0; border-bottom: 2px solid #eee; }" +
                                    ".logo { max-width: 180px; height: auto; }" +
                                    ".content { padding: 20px 0; }" +
                                    ".footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; text-align: center; }"
                                    +
                                    ".event-detail { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }"
                                    +
                                    "a { color: #44288E !important; text-decoration: none; }" +
                                    "</style>" +
                                    "</head>" +
                                    "<body>" +
                                    "<div class=\"container\">" +
                                    "<div class=\"header\">" +
                                    "<img src=\"" + siteUrl
                                    + "images/logo/360Pipe_logo.png\" alt=\"Site Logo\" class=\"logo\">" +
                                    "</div>" +
                                    "<div class=\"content\">" +
                                    "<p>Hi " + (finalTitle != null && !finalTitle.isEmpty() ? finalTitle : "there")
                                    + ", Your "
                                    + (finalEventType != null ? finalEventType.getTitle() : "Meeting") + " with "
                                    + finalFirstName + " "
                                    + finalLastName + " at " + this.commonService.dbDateToDisplayDateTime(finalDbStart)
                                    + " "
                                    + finalCalTimeZone + " is scheduled. </p>" +
                                    "<p><a href=\"" + finalEditAppointmentUrl
                                    + "\" target=\"_blank\" style=\"background-color: #44288E; color: #ffffff !important; padding: 7px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-top: 6px;\">Edit Date/Time</a></p>"
                                    +
                                    finalComment +
                                    finalGuestsHtml +
                                    "<p>If you have any questions, please contact us at <a href=\"mailto:360pipeinc@gmail.com\">360pipeinc@gmail.com</a>.</p>"
                                    +
                                    "<p>Thank you for your understanding.</p>" +
                                    "<p>The " + finalCompanyName + " Team</p>" +
                                    "</div>" +
                                    "<div class=\"footer\">" +
                                    "<p>&copy; " + finalCurrentYear + " " + finalCompanyName
                                    + ". All rights reserved.</p>" +
                                    "</div>" +
                                    "</div>" +
                                    "</body>" +
                                    "</html>";
                            this.commonService.sendEmailWithAttachment(email, subject, body, true, finalFileName,
                                    finalFilePath);
                        }
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            });

            Map<String, Object> result = new HashMap<>();
            result.put("title", eventType != null ? eventType.getTitle() : calendar.getCalTitle());
            result.put("start", selectedStart);
            result.put("end", selectedEnd);
            result.put("calTimeZone", calTimeZone);
            result.put("invitee", title);
            result.put("inviteeEmail", inviteeEmail);
            result.put("description", description);
            resBody.put("result", result);

        } catch (Exception e) {
            e.printStackTrace();
            resBody.put("error", "Error setting appointment: " + e.getMessage());
        }
        return resBody;
    }

    @Override
    public Map<String, Object> getEditAppointmentDetails(Integer calendarId, Integer cusId) {
        Map<String, Object> resBody = new HashMap<>();
        resBody.put("error", "");
        try {
            if (calendarId == null) {
                resBody.put("error", "Calendar ID is required");
                return resBody;
            }
            Calendar calendar = this.calendarRepository.findById(calendarId).orElse(null);
            if (calendar == null) {
                resBody.put("error", "Appointment not found");
                return resBody;
            }
            Customers customers = calendar.getCustomers();
            if (customers == null) {
                resBody.put("error", "Customer not found for this appointment");
                return resBody;
            }

            CalendarAppointmentEventType eventType = null;
            if (calendar.getCalAetId() != null && calendar.getCalAetId() > 0) {
                eventType = this.calendarAppointmentEventTypeRepository
                        .findById(Integer.parseInt(calendar.getCalAetId().toString())).orElse(null);
            }

            String calTimeZone = calendar.getCalTimeZone() != null ? calendar.getCalTimeZone() : "";
            if (calTimeZone.isEmpty()) {
                calTimeZone = customers.getTimeZone() != null ? customers.getTimeZone() : serverDatabaseTimeZone;
            }

            String startStr = "";
            String endStr = "";
            if (calendar.getCalStartDateTime() != null) {
                try {
                    startStr = this.commonService.displayDateTime(this.commonService.convertEventTimeZoneToUserDB(
                            calendar.getCalStartDateTime().toString().substring(0, 19), serverDatabaseTimeZone,
                            calTimeZone).substring(0, 19));
                } catch (Exception ignored) {
                }
            }
            if (calendar.getCalEndDateTime() != null) {
                try {
                    endStr = this.commonService.displayDateTime(this.commonService.convertEventTimeZoneToUserDB(
                            calendar.getCalEndDateTime().toString().substring(0, 19), serverDatabaseTimeZone,
                            calTimeZone).substring(0, 19));
                } catch (Exception ignored) {
                }
            }

            String durationHours = eventType != null ? eventType.getDurationHours().toString() : "1";
            String durationMinutes = eventType != null ? eventType.getDurationMinutes().toString() : "00";
            long slotTimeMinus = 60L;
            try {
                slotTimeMinus = Long.parseLong(durationHours) * 60 + Long.parseLong(durationMinutes);
            } catch (Exception ignored) {
            }

            String customerName = (customers.getFirstName() != null ? customers.getFirstName() : "") + " "
                    + (customers.getLastName() != null ? customers.getLastName() : "");

            Map<String, Object> result = new HashMap<>();
            result.put("id", calendar.getId());
            result.put("title", eventType != null ? eventType.getTitle() : calendar.getCalTitle());
            result.put("description", calendar.getCalDescription());
            result.put("calAetId", calendar.getCalAetId());
            result.put("customerId", customers.getId());
            result.put("customerName", customerName.trim());
            result.put("calTimeZone", calTimeZone);
            result.put("memTimeZone", customers.getTimeZone() != null ? customers.getTimeZone() : calTimeZone);
            result.put("durationHours", durationHours);
            result.put("durationMinutes", durationMinutes);
            result.put("slotTimeMinus", slotTimeMinus);
            result.put("start", startStr);
            result.put("end", endStr);
            result.put("attendees", calendar.getCalAttendees());

            resBody.put("result", result);
        } catch (Exception e) {
            e.printStackTrace();
            resBody.put("error", "Error fetching appointment details: " + e.getMessage());
        }
        return resBody;
    }

    @Override
    public Map<String, Object> updateAppointmentDateTime(Map<String, Object> payload) {
        Map<String, Object> resBody = new HashMap<>();
        resBody.put("error", "");
        try {
            Object idObj = payload.get("id");
            if (idObj == null)
                idObj = payload.get("calendarId");
            Integer calendarId = null;
            if (idObj != null) {
                try {
                    calendarId = Integer.parseInt(
                            new String(Base64.getUrlDecoder().decode(idObj.toString()), StandardCharsets.UTF_8));
                } catch (Exception e) {
                    try {
                        calendarId = Integer.parseInt(
                                new String(Base64.getDecoder().decode(idObj.toString()), StandardCharsets.UTF_8));
                    } catch (Exception e2) {
                        calendarId = Integer.parseInt(idObj.toString());
                    }
                }
            }

            if (calendarId == null) {
                resBody.put("error", "Calendar ID is required");
                return resBody;
            }

            Calendar calendar = this.calendarRepository.findById(calendarId).orElse(null);
            if (calendar == null) {
                resBody.put("error", "Appointment not found");
                return resBody;
            }

            Customers customers = calendar.getCustomers();
            if (customers == null) {
                resBody.put("error", "Customer not found");
                return resBody;
            }

            String start = payload.get("start") != null ? payload.get("start").toString() : "";
            String end = payload.get("end") != null ? payload.get("end").toString() : "";
            String calTimeZone = payload.get("timeZone") != null ? payload.get("timeZone").toString()
                    : (payload.get("calTimeZone") != null ? payload.get("calTimeZone").toString()
                            : calendar.getCalTimeZone());

            String timeZone = serverDatabaseTimeZone;
            String dbStart = start;
            String dbEnd = end;
            try {
                if (start != null && !start.isEmpty()) {
                    dbStart = this.commonService.dbDateTime(start);
                }
                if (end != null && !end.isEmpty()) {
                    dbEnd = this.commonService.dbDateTime(end);
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }

            Date calStartDate = null;
            Date calEndDate = null;
            try {
                if (dbStart != null && !dbStart.isEmpty()) {
                    calStartDate = this.commonService.convertDate(
                            this.commonService.convertEventTimeZoneToUserDB(dbStart, calTimeZone, timeZone));
                }
                if (dbEnd != null && !dbEnd.isEmpty()) {
                    calEndDate = this.commonService.convertDate(
                            this.commonService.convertEventTimeZoneToUserDB(dbEnd, calTimeZone, timeZone));
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }

            calendar.setCalStartDateTime(calStartDate);
            calendar.setCalEndDateTime(calEndDate);
            calendar.setCalTimeZone(calTimeZone);
            calendar.setCalUpdatedDateTime(new Timestamp(System.currentTimeMillis()));
            calendar = this.calendarRepository.save(calendar);

            // Extract attendee emails as List<String>
            String calAtt = calendar.getCalAttendees() != null ? calendar.getCalAttendees() : "{\"attendees\":[]}";
            JSONObject attData = new JSONObject(calAtt);
            JSONArray attendees = attData.optJSONArray("attendees") != null ? attData.getJSONArray("attendees")
                    : new JSONArray();

            List<String> attendeesList = new ArrayList<>();
            for (int i = 0; i < attendees.length(); i++) {
                attendeesList.add(attendees.getString(i));
            }

            // Google & Outlook Sync
            List<CalendarDetails> calendarDetailsList = this.calendarDetailsRepository
                    .findCalendarDetailsList(calendar.getId());

            // Google Calendar Sync
            if (customers.getGoogleCalendarRefreshToken() != null
                    && !customers.getGoogleCalendarRefreshToken().isEmpty()) {
                try {
                    GoogleCalendarDto googleCalendarDto = new GoogleCalendarDto();
                    googleCalendarDto.setCalTitle(calendar.getCalTitle());
                    googleCalendarDto.setCalDescription(
                            calendar.getCalDescription() != null ? calendar.getCalDescription() : "");
                    googleCalendarDto.setCalStartDateTime(start);
                    googleCalendarDto.setCalEndDateTime(end);
                    googleCalendarDto.setCalAllDay(calendar.getCalAllDay() != null ? calendar.getCalAllDay() : "false");
                    googleCalendarDto.setCalTimeZone(calTimeZone);
                    googleCalendarDto.setCalAttendees(attendeesList);
                    googleCalendarDto.setLocation("");

                    String googleSycId = "";
                    CalendarDetails googleCd = null;
                    if (calendarDetailsList != null) {
                        for (CalendarDetails cd : calendarDetailsList) {
                            if ("google".equalsIgnoreCase(cd.getCaldType())) {
                                googleSycId = cd.getCaldSycId();
                                googleCd = cd;
                                break;
                            }
                        }
                    }
                    googleCalendarDto.setCaldSycId(googleSycId != null ? googleSycId : "");
                    Map<String, Object> gRes = this.googleCalendarService.saveEvent(customers.getId(),
                            googleCalendarDto);
                    if (gRes != null && gRes.get("caldSycId") != null && !gRes.get("caldSycId").toString().isEmpty()) {
                        if (googleCd == null) {
                            googleCd = new CalendarDetails();
                            googleCd.setCalendar(calendar);
                            googleCd.setCaldType("google");
                        }
                        googleCd.setCaldSycId(gRes.get("caldSycId").toString());
                        this.calendarDetailsRepository.save(googleCd);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            // Outlook Calendar Sync
            if (customers.getOutlookCalendarRefreshToken() != null
                    && !customers.getOutlookCalendarRefreshToken().isEmpty()) {
                try {
                    OutlookCalendarDto outlookCalendarDto = new OutlookCalendarDto();
                    outlookCalendarDto.setCalTitle(calendar.getCalTitle());
                    outlookCalendarDto.setCalDescription(
                            calendar.getCalDescription() != null ? calendar.getCalDescription() : "");
                    outlookCalendarDto.setCalStartDateTime(start);
                    outlookCalendarDto.setCalEndDateTime(end);
                    outlookCalendarDto
                            .setCalAllDay(calendar.getCalAllDay() != null ? calendar.getCalAllDay() : "false");
                    outlookCalendarDto.setCalTimeZone(calTimeZone);
                    outlookCalendarDto.setCalAttendees(attendeesList);
                    outlookCalendarDto.setLocation("");

                    String outlookSycId = "";
                    CalendarDetails outlookCd = null;
                    if (calendarDetailsList != null) {
                        for (CalendarDetails cd : calendarDetailsList) {
                            if ("outlook".equalsIgnoreCase(cd.getCaldType())) {
                                outlookSycId = cd.getCaldSycId();
                                outlookCd = cd;
                                break;
                            }
                        }
                    }
                    outlookCalendarDto.setCaldSycId(outlookSycId != null ? outlookSycId : "");
                    Map<String, Object> oRes = this.outlookCalendarService.saveEvent(customers.getId(),
                            outlookCalendarDto);
                    if (oRes != null && oRes.get("caldSycId") != null && !oRes.get("caldSycId").toString().isEmpty()) {
                        if (outlookCd == null) {
                            outlookCd = new CalendarDetails();
                            outlookCd.setCalendar(calendar);
                            outlookCd.setCaldType("outlook");
                        }
                        outlookCd.setCaldSycId(oRes.get("caldSycId").toString());
                        this.calendarDetailsRepository.save(outlookCd);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            // Regenerate ICS file and send updated confirmation emails
            Integer cusId = customers.getId();
            String memEmail = customers.getEmailAddress();
            String googleCalendarEmail = customers.getGoogleCalendarEmail();
            String outlookCalendarEmail = customers.getOutlookCalendarEmail();
            String firstName = customers.getFirstName() != null ? customers.getFirstName() : "";
            String lastName = customers.getLastName() != null ? customers.getLastName() : "";
            String memTimeZone = customers.getTimeZone() != null ? customers.getTimeZone() : calTimeZone;

            String calAtt2 = calendar.getCalAttendees() != null ? calendar.getCalAttendees() : "{\"attendees\":[]}";
            JSONObject attData2 = new JSONObject(calAtt2);
            JSONArray attendees2 = attData2.optJSONArray("attendees") != null ? attData2.getJSONArray("attendees")
                    : new JSONArray();

            List<String> guestICSList = new ArrayList<>();
            for (int i = 0; i < attendees2.length(); i++) {
                guestICSList.add(attendees2.getString(i));
            }

            String fileName = "invite.ics";
            String filePath = icsDownloadPath + cusId + "/" + fileName;
            String rootPath = icsDownloadPath + cusId + "/";

            CalendarAppointmentEventType eventType = null;
            if (calendar.getCalAetId() != null && calendar.getCalAetId() > 0) {
                eventType = this.calendarAppointmentEventTypeRepository
                        .findById(Integer.parseInt(calendar.getCalAetId().toString())).orElse(null);
            }
            String eventTitle = eventType != null ? eventType.getTitle() : calendar.getCalTitle();
            int currentYear = java.time.Year.now().getValue();

            String encodedCusId = Base64.getUrlEncoder()
                    .encodeToString(String.valueOf(customers.getId()).getBytes(StandardCharsets.UTF_8));
            String encodedTargetCalId = Base64.getUrlEncoder()
                    .encodeToString(String.valueOf(calendar.getId()).getBytes(StandardCharsets.UTF_8));
            String editAppointmentUrl = siteUrl + "edit-appointment?id=" + encodedTargetCalId + "&v=" + encodedCusId;

            final ICSEventDto finalEventDto = new ICSEventDto();
            finalEventDto.setReplyToAdd(memEmail);
            finalEventDto.setStartDate(this.commonService.convertDate(this.commonService
                    .convertEventTimeZoneToUserDB(dbStart, calTimeZone, TimeZone.getDefault().getID())));
            finalEventDto.setEndDate(this.commonService.convertDate(this.commonService
                    .convertEventTimeZoneToUserDB(dbEnd, calTimeZone, TimeZone.getDefault().getID())));
            finalEventDto.setSummary(calendar.getCalTitle());
            finalEventDto.setDescription(
                    this.commonService.br2nl(calendar.getCalDescription() != null ? calendar.getCalDescription() : ""));
            finalEventDto.setAttendees(guestICSList);
            finalEventDto.setMemberName(this.commonService
                    .ucWords((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")));
            finalEventDto.setTimeZone(calTimeZone);

            final String finalFilePath = filePath;
            final String finalFileName = fileName;
            final String finalRootPath = rootPath;
            final String finalSiteNameBigCom = siteNameBigCom;
            final String finalMemEmail = memEmail;
            final String finalGoogleCalendarEmail = googleCalendarEmail;
            final String finalOutlookCalendarEmail = outlookCalendarEmail;
            final String finalDbStart = dbStart;
            final String finalCalTimeZone = calTimeZone;
            final String finalMemTimeZone = memTimeZone;
            final String finalFirstName = firstName;
            final String finalLastName = lastName;
            final String finalEventTitle = eventTitle;
            final String finalEditAppointmentUrl = editAppointmentUrl;
            final String finalCompanyName = companyName;
            final int finalCurrentYear = currentYear;
            final JSONArray finalAttendees = attendees;
            final String finalSiteUrl = siteUrl;

            CompletableFuture.runAsync(() -> {
                try {
                    File f = new File(finalRootPath);
                    if (!f.exists()) {
                        f.mkdirs();
                    }
                    ICS.generateICSFile(finalEventDto, finalFilePath, finalSiteNameBigCom);

                    String hostEmailBody = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Meeting Rescheduled</title>"
                            + "<style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }"
                            + ".container { max-width: 600px; margin: 0 auto; padding: 20px; }"
                            + ".header { text-align: center; padding: 20px 0; border-bottom: 2px solid #eee; }"
                            + ".logo { max-width: 180px; height: auto; }"
                            + ".content { padding: 20px 0; }"
                            + ".footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; text-align: center; }"
                            + "</style></head><body><div class=\"container\"><div class=\"header\">"
                            + "<img src=\"" + siteUrl
                            + "images/logo/360Pipe_logo.png\" alt=\"Site Logo\" class=\"logo\"></div>"
                            + "<div class=\"content\">"
                            + "<p>Hi " + finalFirstName + " " + finalLastName + ",</p>"
                            + "<p>The meeting has been rescheduled to a new date/time.</p>"
                            + "<p><b>Event Type:</b> " + finalEventTitle + "</p>"
                            + "<p><b>Your New Date/Time:</b> "
                            + this.commonService.dbDateToDisplayDateTime(this.commonService
                                    .convertEventTimeZoneToUserDB(finalDbStart, finalCalTimeZone, finalMemTimeZone))
                            + "</p>"
                            + "<p><a href=\"" + finalEditAppointmentUrl
                            + "\" target=\"_blank\" style=\"background-color: #44288E; color: #ffffff !important; padding: 7px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-top: 6px;\">Edit Date/Time</a></p>"
                            + "<p><b>Timezone:</b> " + finalMemTimeZone + "</p>"
                            + "<p>Updated calendar invitation has been attached.</p>"
                            + "<p>The " + finalCompanyName + " Team</p></div>"
                            + "<div class=\"footer\"><p>&copy; " + finalCurrentYear + " " + finalCompanyName
                            + ". All rights reserved.</p></div></div></body></html>";

                    if (finalMemEmail != null && !finalMemEmail.isEmpty()) {
                        this.commonService.sendEmailWithAttachment(finalMemEmail,
                                "Meeting Rescheduled: " + finalEventTitle, hostEmailBody, true, finalFileName,
                                finalFilePath);
                        if (!finalMemEmail.equals(finalGoogleCalendarEmail) && finalGoogleCalendarEmail != null
                                && !finalGoogleCalendarEmail.isEmpty()) {
                            this.commonService.sendEmailWithAttachment(finalGoogleCalendarEmail,
                                    "Meeting Rescheduled: " + finalEventTitle, hostEmailBody, true, finalFileName,
                                    finalFilePath);
                        }
                        if (!finalMemEmail.equals(finalOutlookCalendarEmail) && finalOutlookCalendarEmail != null
                                && !finalOutlookCalendarEmail.isEmpty()) {
                            this.commonService.sendEmailWithAttachment(finalOutlookCalendarEmail,
                                    "Meeting Rescheduled: " + finalEventTitle, hostEmailBody, true, finalFileName,
                                    finalFilePath);
                        }
                    }

                    for (int i = 0; i < finalAttendees.length(); i++) {
                        String attendeeEmail = finalAttendees.getString(i);
                        if (!attendeeEmail.equalsIgnoreCase(finalMemEmail)) {
                            String attendeeEmailBody = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Meeting Rescheduled</title>"
                                    + "<style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }"
                                    + ".container { max-width: 600px; margin: 0 auto; padding: 20px; }"
                                    + ".header { text-align: center; padding: 20px 0; border-bottom: 2px solid #eee; }"
                                    + ".logo { max-width: 180px; height: auto; }"
                                    + ".content { padding: 20px 0; }"
                                    + ".footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; text-align: center; }"
                                    + "</style></head><body><div class=\"container\"><div class=\"header\">"
                                    + "<img src=\"" + siteUrl
                                    + "images/logo/360Pipe_logo.png\" alt=\"Site Logo\" class=\"logo\"></div>"
                                    + "<div class=\"content\">"
                                    + "<p>Hi,</p>"
                                    + "<p>Your meeting with " + finalFirstName + " " + finalLastName
                                    + " has been rescheduled.</p>"
                                    + "<p><b>Event Type:</b> " + finalEventTitle + "</p>"
                                    + "<p><b>New Date/Time:</b> "
                                    + this.commonService.dbDateToDisplayDateTime(finalDbStart) + " (" + finalCalTimeZone
                                    + ")</p>"
                                    + "<p><a href=\"" + finalEditAppointmentUrl
                                    + "\" target=\"_blank\" style=\"background-color: #44288E; color: #ffffff !important; padding: 7px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-top: 6px;\">Edit Date/Time</a></p>"
                                    + "<p>Updated calendar invitation has been attached.</p>"
                                    + "<p>The " + finalCompanyName + " Team</p></div>"
                                    + "<div class=\"footer\"><p>&copy; " + finalCurrentYear + " " + finalCompanyName
                                    + ". All rights reserved.</p></div></div></body></html>";
                            this.commonService.sendEmailWithAttachment(attendeeEmail,
                                    "Meeting Rescheduled: " + finalEventTitle, attendeeEmailBody, true, finalFileName,
                                    finalFilePath);
                        }
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            });

            Map<String, Object> result = new HashMap<>();
            result.put("id", calendar.getId());
            result.put("title", calendar.getCalTitle());
            result.put("start", start);
            result.put("end", end);
            result.put("calTimeZone", calTimeZone);
            result.put("customerId", customers.getId());
            resBody.put("result", result);

        } catch (Exception e) {
            e.printStackTrace();
            resBody.put("error", "Error updating appointment: " + e.getMessage());
        }
        return resBody;
    }

    @Override
    public List<com.q4magic.common.models.Calendar> getMyCalendarAppointmentLis(Integer count, Integer cusId) {
        Date currentDate = new Date();
        Pageable pageable = PageRequest.of(0, count);
        List<Calendar> calenderList = this.calendarRepository.findUpcomingAppointmentList(cusId, currentDate, pageable);
        return calenderList;
    }

    @Override
    public Map<String, Object> sendEmailAppointmentLink(SendAppointmentLinkDto sendAppointmentLinkDto) {
        Map<String, Object> resBody = new HashMap<>();
        resBody.put("error", "");
        try {
            if (sendAppointmentLinkDto.getEmailsList() != null) {
                CompletableFuture.runAsync(() -> {
                    try {
                        for (String email : sendAppointmentLinkDto.getEmailsList()) {
                            String subject = "Meeting Link";
                            String body = sendAppointmentLinkDto.getMessage();
                            this.commonService.sendEmail(email, subject, body, false);
                        }
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                });
            }
        } catch (Exception e) {
            resBody.put("error", "Invalid data");
            e.printStackTrace();
            throw new RuntimeException(e);
        }
        return resBody;
    }
}

// package com.q4magic.calendar.calendarAppointment.serviceImpl;
//
// import
// com.q4magic.calendar.calendarAppointment.service.CalendarAppointmentService;
// import com.q4magic.common.dto.*;
// import com.q4magic.common.googleCalendar.service.GoogleCalendarService;
// import com.q4magic.common.models.*;
// import com.q4magic.common.models.Calendar;
// import com.q4magic.common.repository.*;
// import com.q4magic.common.service.CommonService;
// import com.q4magic.util.ICS;
// import org.json.JSONArray;
// import org.json.JSONObject;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.data.domain.PageRequest;
// import org.springframework.data.domain.Pageable;
// import org.springframework.stereotype.Service;
//
// import java.io.File;
// import java.sql.Time;
// import java.sql.Timestamp;
// import java.text.ParseException;
// import java.util.*;
//
// @Service(value = "CalendarAppointmentService")
// public class CalendarAppointmentServiceImpl implements
// CalendarAppointmentService {
// @Value("${server.database.timezone}")
// String serverDatabaseTimeZone;
//
// @Value("${companyName}")
// String companyName;
//
// @Value("${icsdownload-dir}")
// private String icsDownloadPath;
//
// @Value("${siteNameBigCom}")
// String siteNameBigCom;
//
// @Value("${siteUrl}")
// String siteUrl;
//
// @Autowired
// private CalendarAppointmentAvailabilitySlotsRepository
// calendarAppointmentAvailabilitySlotsRepository;
//
// @Autowired
// private CustomersRepository customersRepository;
//
// @Autowired
// private CommonService commonService;
//
// @Autowired
// private CalendarRepository calendarRepository;
//
// @Autowired
// private GoogleCalendarService googleCalendarService;
//
// @Autowired
// private CalendarAppointmentEventTypeRepository
// calendarAppointmentEventTypeRepository;
//
// @Autowired
// private CalendarNotificationRepository calendarNotificationRepository;
//
// @Override
// public List<CalendarAppointmentAvailabilitySlotsDto>
// getAvailabilitySlotsList(Integer cusId) {
// try {
// List<CalendarAppointmentAvailabilitySlots>
// calendarAppointmentAvailabilitySlots =
// calendarAppointmentAvailabilitySlotsRepository.findByCustomerId(cusId);
// List<CalendarAppointmentAvailabilitySlotsDto>
// availabilitySlotsListResponseDtos = new ArrayList<>();
// if (!calendarAppointmentAvailabilitySlots.isEmpty()) {
// for (CalendarAppointmentAvailabilitySlots availabilitySlots :
// calendarAppointmentAvailabilitySlots) {
// CalendarAppointmentAvailabilitySlotsDto availabilitySlotsDto = new
// CalendarAppointmentAvailabilitySlotsDto();
// availabilitySlotsDto.setId(availabilitySlots.getId());
// availabilitySlotsDto.setDayName(availabilitySlots.getDayName());
// availabilitySlotsDto.setAvailable(availabilitySlots.getAvailable());
// availabilitySlotsDto.setStartTime(availabilitySlots.getStartTime().toString());
// availabilitySlotsDto.setEndTime(availabilitySlots.getEndTime().toString());
// availabilitySlotsDto.setAvailable(availabilitySlots.getAvailable());
// availabilitySlotsListResponseDtos.add(availabilitySlotsDto);
// }
// }
// return availabilitySlotsListResponseDtos;
// } catch (Exception e) {
// e.printStackTrace();
// throw new RuntimeException(e);
// }
// }
//
// @Override
// public Map<String, Object> saveAvailabilitySlots(Integer cusId,
// List<CalendarAppointmentAvailabilitySlotsDto> list) {
// Map<String, Object> resBody = new HashMap<>();
// resBody.put("error", "");
// try {
// for (CalendarAppointmentAvailabilitySlotsDto dto : list) {
// CalendarAppointmentAvailabilitySlots availabilitySlots =
// this.calendarAppointmentAvailabilitySlotsRepository.findById(dto.getId()).orElse(new
// CalendarAppointmentAvailabilitySlots());
// Customers customers =
// this.customersRepository.findById(dto.getCusId()).orElseThrow(() -> new
// RuntimeException("Customer Not Found"));
// availabilitySlots.setCreatedDate(new Timestamp(System.currentTimeMillis()));
// availabilitySlots.setDayName(dto.getDayName());
// availabilitySlots.setAvailable(dto.getAvailable());
//
// availabilitySlots.setStartTime(Time.valueOf(dto.getStartTime()));
// availabilitySlots.setEndTime(Time.valueOf(dto.getEndTime()));
// availabilitySlots.setCustomers(customers);
// availabilitySlots.setCreatedDate(new Timestamp(System.currentTimeMillis()));
// this.calendarAppointmentAvailabilitySlotsRepository.save(availabilitySlots);
// }
//
// } catch (Exception e) {
// e.printStackTrace();
// resBody.put("error", e.getMessage());
// }
//
// return resBody;
// }
//
// @Override
// public Map<String, Object> freeSlotList(String userTimeZone, FreeSlotListDto
// freeSlotListDto) {
// Map<String, Object> resBody = new HashMap<>();
// try {
// Customers customers =
// this.customersRepository.findById(freeSlotListDto.getSlotUserId()).orElseThrow(()
// -> new RuntimeException("Customer Not Found"));
//
// if (freeSlotListDto.getSlotDateTime().length() > 10) {
// freeSlotListDto.setSlotDateTime(this.commonService.convertEventTimeZoneToUser(freeSlotListDto.getSlotDateTime(),
// freeSlotListDto.getTimeZone(), serverDatabaseTimeZone));
// }
//
// String aasDayName =
// this.commonService.dayName(freeSlotListDto.getSlotDateTime());
// CalendarAppointmentAvailabilitySlots availabilitySlots = null;
// try {
// availabilitySlots =
// this.calendarAppointmentAvailabilitySlotsRepository.findSlot(customers.getId(),
// aasDayName);
// } catch (Exception e) {
// e.printStackTrace();
// throw new RuntimeException(e);
// }
//
// String startTime = "00:00:00";
// String endTime = "24:00:00";
//
// String aasAvailableYN = "Y";
// if (availabilitySlots != null) {
// startTime = availabilitySlots.getStartTime().toString();
// endTime = availabilitySlots.getEndTime().toString();
// aasAvailableYN = availabilitySlots.getAvailable();
//
// String memberTimeZone = userTimeZone;
//
// String tempStartDateTime =
// this.commonService.convertEventTimeZoneToUser(freeSlotListDto.getSlotDateTime().substring(0,
// 10) + " " + startTime, memberTimeZone, freeSlotListDto.getTimeZone());
//
// String tempEndDateTime =
// this.commonService.convertEventTimeZoneToUser(freeSlotListDto.getSlotDateTime().substring(0,
// 10) + " " + endTime, memberTimeZone, freeSlotListDto.getTimeZone());
//
// String[] tempStart = tempStartDateTime.split(" ");
// String[] tempEnd = tempEndDateTime.split(" ");
// if (tempStart[0].equals(tempEnd[0])) {
// startTime = this.commonService.lastCharaters(tempStartDateTime, 8);
// endTime = this.commonService.lastCharaters(tempEndDateTime, 8);
// } else {
// startTime = this.commonService.lastCharaters(tempStartDateTime, 8);
// endTime = "24:00:00";
// if (!tempStart[0].equals(freeSlotListDto.getSlotDateTime().substring(0, 10)))
// {
// startTime =
// this.commonService.remainingTime(freeSlotListDto.getSlotTimeMinus(),
// startTime, endTime);
// endTime = this.commonService.lastCharaters(tempEndDateTime, 8);
// }
// }
// }
//
// List<String> slotList = new ArrayList<>();
// if (aasAvailableYN.equals("Y")) {
// slotList = this.commonService.slotList(freeSlotListDto.getSlotTimeMinus(),
// startTime, endTime);
// // Current Date Slot List Start
// if (freeSlotListDto.getCurrentDateYN().equals("Y")) {
// List<String> slotNewList = new ArrayList<>();
// for (String sl : slotList) {
// if (this.commonService.checkBigFirstTime(sl,
// this.commonService.currentTime(freeSlotListDto.getTimeZone()))) {
// slotNewList.add(sl);
// }
// }
// slotList = slotNewList;
// }
//
// String slotDateTime = "";
// try {
// if (Objects.nonNull(freeSlotListDto.getSlotDateTime())) {
// slotDateTime = this.commonService.dbDate(freeSlotListDto.getSlotDateTime());
// }
// } catch (ParseException e) {
// e.printStackTrace();
// new RuntimeException(e);
// }
// List<com.q4magic.common.models.Calendar> bookSlotList =
// this.calendarRepository.findBookList(customers.getId(), slotDateTime);
// Boolean calAllDay = false;
// for (com.q4magic.common.models.Calendar bookSlot : bookSlotList) {
// startTime =
// this.commonService.displayDbDateTimeToTime(this.commonService.convertEventTimeZoneToUserDB(bookSlot.getCalStartDateTime().toString().substring(0,
// 19), serverDatabaseTimeZone, freeSlotListDto.getTimeZone()).substring(0,
// 19));
// endTime =
// this.commonService.displayDbDateTimeToTime(this.commonService.convertEventTimeZoneToUserDB(bookSlot.getCalEndDateTime().toString().substring(0,
// 19), serverDatabaseTimeZone, freeSlotListDto.getTimeZone()).substring(0,
// 19));
// calAllDay = Boolean.valueOf(bookSlot.getCalAllDay());
// if (calAllDay) {
// break;
// }
// slotList =
// this.commonService.removeBookSlot(freeSlotListDto.getSlotTimeMinus(),
// slotList, startTime, endTime);
// }
//
// if (calAllDay) {
// slotList = new ArrayList<>();
// }
// }
// resBody.put("freeSlotList", slotList);
// } catch (Exception e) {
// e.printStackTrace();
// new RuntimeException(e.getMessage());
// }
// return resBody;
//
// }
//
// @Override
// public Map<String, Object> saveAppointment(CalendarDto calendarDto) {
// Map<String, Object> resBody = new HashMap<>();
// Map<String, Object> innerResBody = new HashMap<>();
// resBody.put("error", "");
// try {
// Integer cusId = calendarDto.getCustomerId();
// innerResBody = this.googleCalendarService.getUserTimezone(cusId);
// String timeZone = null;
// if (innerResBody.get("calTimeZone") != null) {
// timeZone = innerResBody.get("calTimeZone").toString();
// }
// if (calendarDto.getCalTimeZone().equals("")) {
// if (timeZone != null) {
// calendarDto.setCalTimeZone(timeZone);
// }
// }
// // Set Database Timezone : Not Delete
// timeZone = serverDatabaseTimeZone;
//
// try {
// if (Objects.nonNull(calendarDto.getStart())) {
// calendarDto.setStart(this.commonService.dbDateTime(calendarDto.getStart()));
// }
// if (Objects.nonNull(calendarDto.getEnd())) {
// calendarDto.setEnd(this.commonService.dbDateTime(calendarDto.getEnd()));
// }
// } catch (ParseException e) {
// e.printStackTrace();
// }
//
// String startDateTime = null;
// try {
// if (Objects.nonNull(calendarDto.getStart())) {
// startDateTime =
// this.commonService.convertEventTimeZoneToUserDB(calendarDto.getStart(),
// calendarDto.getCalTimeZone(), timeZone);
// startDateTime = this.commonService.displayDateTime(calendarDto.getStart());
// }
// } catch (ParseException e) {
// e.printStackTrace();
// }
//
// Customers customers = this.customersRepository.findById(cusId).orElseThrow(()
// -> new RuntimeException("Customer not found!"));
//
// List<String> slotList = new ArrayList<>();
//
// FreeSlotListDto freeSlotListDto = new FreeSlotListDto();
// freeSlotListDto.setSlotDateTime(startDateTime);
// freeSlotListDto.setSlotUserId(calendarDto.getCustomerId());
// freeSlotListDto.setSlotTimeMinus(calendarDto.getSlotTimeMinus());
// freeSlotListDto.setTimeZone(calendarDto.getCalTimeZone());
// freeSlotListDto.setCurrentDateYN(calendarDto.getCurrentDateYN());
// innerResBody = freeSlotList(calendarDto.getCalTimeZone(), freeSlotListDto);
// slotList = (List<String>) innerResBody.get("freeSlotList");
//
// String checkSlotTimeValidation =
// this.commonService.convertDateTimeToTime(startDateTime);
// if (slotList.contains(checkSlotTimeValidation)) {
// Calendar calendar = new Calendar();
// calendar.setCalTitle("Meeting with " + calendarDto.getTitle());
//
// String webConference = "";
//// if (member.getWebConference() != null &&
// !member.getWebConference().trim().isEmpty()) {
//// webConference = "\n\n" + member.getWebConference();
//// }
// calendar.setCalDescription(calendarDto.getDescription() + webConference);
//
// calendar.setCustomers(customers);
// calendar.setCalAllDay("false");
// calendar.setCalTimeZone(calendarDto.getCalTimeZone());
// calendar.setCalAttendees(calendarDto.getCalAttendees());
// calendar.setCalAetId(Long.parseLong(calendarDto.getCalAetId().toString()));
// try {
// if (Objects.nonNull(calendarDto.getStart())) {
// calendar.setCalStartDateTime(this.commonService.convertDate(this.commonService.convertEventTimeZoneToUserDB(calendarDto.getStart(),
// calendarDto.getCalTimeZone(), timeZone)));
// }
// if (Objects.nonNull(calendarDto.getEnd())) {
// calendar.setCalEndDateTime(this.commonService.convertDate(this.commonService.convertEventTimeZoneToUserDB(calendarDto.getEnd(),
// calendarDto.getCalTimeZone(), timeZone)));
// }
// } catch (ParseException e) {
// e.printStackTrace();
// }
//
// calendar.setCalCreatedDateTime(new Timestamp(System.currentTimeMillis()));
// calendar.setCalUpdatedDateTime(new Timestamp(System.currentTimeMillis()));
// calendar.setCalNotification("N");
//
// String numbers = "";
// for (String number : calendarDto.getContactList()) {
// if (numbers.equals("")) {
// numbers = number;
// } else {
// numbers += "," + number;
// }
// }
// calendar.setCalNumbers(numbers);
// calendar.setCalType(companyName.toLowerCase().replace(" ", ""));
// calendar.setCalEventReminder("event");
// calendar.setCalReminderSubject("");
// calendar.setCalReminderType("");
// calendar.setCalMyPageId(0L);
// calendar.setCalSmsSstId(0L);
// calendar.setCalScheduleDateTime(new Timestamp(System.currentTimeMillis()));
// calendar = calendarRepository.save(calendar);
//
// // member notification start
// try {
// String emailNotification = customers.getEmailNotification();
// if(emailNotification != null && !emailNotification.equals("")) {
// for (String minutes:emailNotification.split(",")) {
// CalendarNotification calendarNotification = new CalendarNotification();
// calendarNotification.setCalendar(calendar);
// calendarNotification.setMinutes(Long.valueOf(minutes));
// calendarNotification.setCreatedDate(new
// Timestamp(System.currentTimeMillis()));
// calendarNotification.setNotification("N");
// this.calendarNotificationRepository.save(calendarNotification);
// }
// }
// } catch (Exception e) {
// e.printStackTrace();
// }
// // member notification end
//
// String calAtt = calendar.getCalAttendees();
// JSONObject data = new JSONObject(calAtt);
// JSONArray attendees = data.getJSONArray("attendees");
// String inviteeEmail = attendees.get(attendees.length() -
// 1).toString().toLowerCase();
//
// String guestsList = "";
// List<String> guestICSList = new ArrayList<>();
// guestICSList.add(inviteeEmail);
// for (int i = 0; i < attendees.length() - 1; i++) {
// if (guestsList.equals("")) {
// guestsList += attendees.get(i).toString().toLowerCase();
// } else {
// guestsList += "<br />" + attendees.get(i).toString().toLowerCase();
// }
// guestICSList.add(attendees.get(i).toString().toLowerCase());
// }
// String memEmail = customers.getEmailAddress();
// String firstName = customers.getFirstName();
// String lastName = customers.getLastName();
// String googleCalendarEmail = customers.getGoogleCalendarEmail();
// String outlookCalendarEmail = customers.getOutlookCalendarEmail();
//
// // ICS File Code Start
// String icsFileDescription =
// this.commonService.nl2br(calendarDto.getDescription() + webConference);
//
//// if(member.getWebConference() != null) {
//// icsFileDescription += "<br /><br />Web Conference Link :<br
// />"+member.getWebConference();
//// }
//
// icsFileDescription += "<br /><br />Guest Email(s) :<br />" + inviteeEmail;
// if (!guestsList.equals("")) {
// icsFileDescription += "<br />" + guestsList;
// }
//
// String smsNumberList = "";
// if (calendarDto.getContactList().size() > 0) {
// for (int i = 0; i < calendarDto.getContactList().size(); i++) {
// if (smsNumberList.equals("")) {
// smsNumberList += calendarDto.getContactList().get(i);
// } else {
// smsNumberList += "<br />" + calendarDto.getContactList().get(i);
// }
// }
// }
//
// if (!smsNumberList.equals("")) {
// icsFileDescription += "<br /><br />Mobile Number(s) :<br />" + smsNumberList;
// }
//
// ICSEventDto eventDto = new ICSEventDto();
// eventDto.setReplyToAdd(memEmail);
// eventDto.setStartDate(this.commonService.convertDate(this.commonService.convertEventTimeZoneToUserDB(calendarDto.getStart(),
// calendarDto.getCalTimeZone(), TimeZone.getDefault().getID())));
// eventDto.setEndDate(this.commonService.convertDate(this.commonService.convertEventTimeZoneToUserDB(calendarDto.getEnd(),
// calendarDto.getCalTimeZone(), TimeZone.getDefault().getID())));
// eventDto.setSummary(calendar.getCalTitle());
//// eventDto.setDescription(this.commonService.findLinkAndReplace(this.commonService.br2nl(icsFileDescription)));
// eventDto.setDescription(this.commonService.br2nl(icsFileDescription));
// eventDto.setAttendees(guestICSList);
// eventDto.setMemberName(this.commonService.ucWords(firstName.trim() + " " +
// lastName.trim()));
// eventDto.setTimeZone(calendarDto.getCalTimeZone());
// String rootPath = icsDownloadPath + cusId + "/";
// File f = new File(rootPath);
// if (!f.exists()) {
// f.mkdirs();
// }
// String fileName = "CalendarInvite.ics";
// String filePath = rootPath + fileName;
// File myFile = new File(filePath);
// if (myFile.exists()) {
// myFile.delete();
// }
// ICS.generateICSFile(eventDto, filePath, siteNameBigCom);
//
//
// String guestsHtml = "";
// if (guestsList != null && !guestsList.trim().isEmpty()) {
// guestsHtml =
// "<p><b>Guests:</b></p>" +
// "<p>" + guestsList + "<br /><br /></p>";
// }
//
// String comment = "";
// if (calendarDto.getDescription() != null &&
// !calendarDto.getDescription().trim().isEmpty()) {
// comment = "<p><b>Kindly see the details of the meeting.</b></p><p>" +
// calendarDto.getDescription() + "<br /><br /></p>";
// }
// int currentYear = java.time.Year.now().getValue();
// CalendarAppointmentEventType eventType =
// this.calendarAppointmentEventTypeRepository.findById(Integer.parseInt(calendarDto.getCalAetId().toString())).orElse(null);
// if (memEmail != null && !memEmail.equals("")) {
// String subject = "New Event Meeting";
// String body = "<!DOCTYPE html>" +
// "<html>" +
// "<head>" +
// "<meta charset=\"UTF-8\">" +
// "<title>New Event Meeting</title>" +
// "<style>" +
// "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333;
// margin: 0; padding: 0; }" +
// ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
// ".header { text-align: center; padding: 20px 0; border-bottom: 2px solid
// #eee; }" +
// ".logo { max-width: 180px; height: auto; }" +
// ".content { padding: 20px 0; }" +
// ".footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;
// font-size: 0.9em; color: #777; text-align: center; }" +
// ".event-detail { background: #f9f9f9; padding: 15px; border-radius: 8px;
// margin: 15px 0; }" +
// "a { color: #44288E !important; text-decoration: none; }" +
// "</style>" +
// "</head>" +
// "<body>" +
// "<div class=\"container\">" +
// "<div class=\"header\">" +
// "<img src=\"" + siteUrl + "images/logo/360Pipe_logo.png\" alt=\"Site Logo\"
// class=\"logo\">" +
// "</div>" +
// "<div class=\"content\">" +
// "<p>Hi " + firstName + " " + lastName + ", A new meeting has been scheduled.
// </p>" +
// "<p><b>Event Type:</b></p><p>" + eventType.getTitle() + "<br /><br /></p>" +
// "<p><b>Invitee:</b></p><p>" + calendarDto.getTitle() + "<br /><br /></p>" +
// "<p><b>Invitee Email:</b></p><p>" + inviteeEmail + "<br /><br /></p>" +
// guestsHtml +
// "<p><b>Invitee Date/Time:</b></p><p>" +
// this.commonService.dbDateToDisplayDateTime(calendarDto.getStart()) + "<br
// /><br /></p>" +
// "<p><b>Invitee Timezone:</b></p><p>" + calendarDto.getCalTimeZone() + "<br
// /><br /></p>" +
// "<p><b>Your Date/Time:</b></p><p>" +
// this.commonService.dbDateToDisplayDateTime(this.commonService.convertEventTimeZoneToUserDB(calendarDto.getStart(),
// calendarDto.getCalTimeZone(), calendarDto.getMemTimeZone())) + "<br /><br
// /></p>" +
// "<p><b>Your Timezone:</b></p><p>" + calendarDto.getMemTimeZone() + "<br /><br
// /></p>" +
// comment +
// "<p>If you have any questions, please contact us at <a
// href=\"mailto:360pipeinc@gmail.com\">360pipeinc@gmail.com</a>.</p>" +
// "<p>Thank you for your understanding.</p>" +
// "<p>The " + companyName + " Team</p>" +
// "</div>" +
// "<div class=\"footer\">" +
// "<p>&copy; " + currentYear + " " + companyName + ". All rights reserved.</p>"
// +
// "</div>" +
// "</div>" +
// "</body>" +
// "</html>";
// this.commonService.sendEmail(memEmail, subject, body, true);
//
// if(!memEmail.equals(googleCalendarEmail)
// && googleCalendarEmail != null) {
// if(!googleCalendarEmail.equals("")) {
// this.commonService.sendEmail(googleCalendarEmail, subject, body, true);
// }
// }
//
// if(!memEmail.equals(outlookCalendarEmail)
// && outlookCalendarEmail != null) {
// if(!outlookCalendarEmail.equals("")) {
// this.commonService.sendEmail(outlookCalendarEmail, subject, body, true);
// }
// }
// }
//
// for (int i = 0; i < attendees.length(); i++) {
// String email = attendees.getString(i);
// if (!email.equals(memEmail)) {
// String subject = "New Event Meeting";
// String body = "<!DOCTYPE html>" +
// "<html>" +
// "<head>" +
// "<meta charset=\"UTF-8\">" +
// "<title>New Event Meeting</title>" +
// "<style>" +
// "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333;
// margin: 0; padding: 0; }" +
// ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
// ".header { text-align: center; padding: 20px 0; border-bottom: 2px solid
// #eee; }" +
// ".logo { max-width: 180px; height: auto; }" +
// ".content { padding: 20px 0; }" +
// ".footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;
// font-size: 0.9em; color: #777; text-align: center; }" +
// ".event-detail { background: #f9f9f9; padding: 15px; border-radius: 8px;
// margin: 15px 0; }" +
// "a { color: #44288E !important; text-decoration: none; }" +
// "</style>" +
// "</head>" +
// "<body>" +
// "<div class=\"container\">" +
// "<div class=\"header\">" +
// "<img src=\"" + siteUrl + "images/logo/360Pipe_logo.png\" alt=\"Site Logo\"
// class=\"logo\">" +
// "</div>" +
// "<div class=\"content\">" +
// "<p>Hi " + firstName + " " + lastName + ", Your " + eventType.getTitle() + "
// with " + fileName + " " + lastName + " at " +
// this.commonService.dbDateToDisplayDateTime(calendarDto.getStart()) + " " +
// calendarDto.getCalTimeZone() + " is scheduled. </p>" +
// comment +
// guestsHtml +
// "<p>If you have any questions, please contact us at <a
// href=\"mailto:360pipeinc@gmail.com\">360pipeinc@gmail.com</a>.</p>" +
// "<p>Thank you for your understanding.</p>" +
// "<p>The " + companyName + " Team</p>" +
// "</div>" +
// "<div class=\"footer\">" +
// "<p>&copy; " + currentYear + " " + companyName + ". All rights reserved.</p>"
// +
// "</div>" +
// "</div>" +
// "</body>" +
// "</html>";
// this.commonService.sendEmailWithAttachment(email, subject, body, true,
// fileName, filePath);
// }
// }
// } else {
// resBody.put("error", "1");
// }
// } catch (Exception e) {
// e.printStackTrace();
// resBody.put("error", "Invalid Data");
// throw new RuntimeException(e);
// }
// return resBody;
// }
//
// @Override
// public List<com.q4magic.common.models.Calendar>
// getMyCalendarAppointmentLis(Integer count, Integer cusId) {
// Date currentDate = new Date();
// Pageable pageable = PageRequest.of(0, count);
// List<Calendar> calenderList =
// this.calendarRepository.findUpcomingAppointmentList(cusId, currentDate,
// pageable);
// return calenderList;
// }
//
// @Override
// public Map<String, Object> sendEmailAppointmentLink(SendAppointmentLinkDto
// sendAppointmentLinkDto) {
// Map<String, Object> resBody = new HashMap<>();
// resBody.put("error", "");
// try {
// for (String email : sendAppointmentLinkDto.getEmailsList()) {
// String subject = "Meeting Link";
// String body = sendAppointmentLinkDto.getMessage();
// this.commonService.sendEmail(email, subject, body, false);
// }
// } catch (Exception e) {
// resBody.put("error", "Invalid data");
// e.printStackTrace();
// throw new RuntimeException(e);
// }
// return resBody;
// }
// }

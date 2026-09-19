package com.q4magic.calendar.calendarAppointment.controller;

import com.q4magic.auth.config.JwtTokenUtil;
import com.q4magic.calendar.calendarAppointment.service.CalendarAppointmentService;
import com.q4magic.common.constants.Constants;
import com.q4magic.common.dto.CalendarAppointmentAvailabilitySlotsDto;
import com.q4magic.common.dto.FreeSlotListDto;
import com.q4magic.common.dto.SendAppointmentLinkDto;
import com.q4magic.common.response.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/calendarAppointment")
public class CalendarAppointmentController {
    @Autowired
    private JwtTokenUtil jwtUtil;

    @Autowired
    private CalendarAppointmentService calendarAppointmentService;

    @GetMapping("/getAvailabilitySlotsList/{cusId}")
    public ApiResponse<?> getAvailabilitySlotsList(@PathVariable Integer cusId) {
        try {
        } catch (Exception e) {
            return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), Constants.ERROR_MSG, "");
        }
        return new ApiResponse<>(HttpStatus.OK.value(), "Fetch Availability Slot Successfully.",
                this.calendarAppointmentService.getAvailabilitySlotsList(cusId));
    }

    @PostMapping("/saveAvailabilitySlots")
    public ApiResponse<?> saveAvailabilitySlots(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestAttribute(value = "cusId", required = false) Integer cusId,
            @RequestBody List<CalendarAppointmentAvailabilitySlotsDto> list) {
        Map<String, Object> resBody = new HashMap<>();
        try {
            if (authorizationHeader != null) {
                cusId = jwtUtil.extractUserId(authorizationHeader.substring(7));
            }
            resBody = this.calendarAppointmentService.saveAvailabilitySlots(cusId, list);
            if (resBody.get("error").equals("")) {
                return new ApiResponse<>(HttpStatus.OK.value(),
                        (list.get(0).getId() == 0 || list.get(0).getId() == null) ? "Add Availability Slot Successfully"
                                : "Update Availability Slot Successfully",
                        resBody);
            } else {
                return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), Constants.ERROR_MSG, resBody);
            }
        } catch (Exception ex) {
            return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), Constants.ERROR_MSG, resBody);
        }
    }

    @PostMapping("/freeSlotList")
    public ApiResponse<?> freeSlotList(@RequestBody FreeSlotListDto freeSlotListDto,
            @RequestParam(value = "userTimeZone") String userTimeZone) {
        Map<String, Object> resBody = new HashMap<>();
        try {
            resBody = this.calendarAppointmentService.freeSlotList(userTimeZone, freeSlotListDto);
        } catch (Exception e) {
            return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), Constants.ERROR_MSG, resBody);
        }
        return new ApiResponse<>(HttpStatus.OK.value(), "Fetch Free Slot Successfully.", resBody);
    }

    @PostMapping("/saveAppointment")
    public ApiResponse<?> saveAppointment(@RequestBody Map<String, Object> payload) {
        Map<String, Object> resBody = new HashMap<>();
        try {
            resBody = calendarAppointmentService.saveAppointment(payload);
            if (resBody.get("error") == null || resBody.get("error").equals("")) {
                return new ApiResponse<>(HttpStatus.OK.value(), "Meeting Request Sent Successfully.", resBody);
            } else if (resBody.get("error").equals("1")) {
                return new ApiResponse<>(HttpStatus.NOT_MODIFIED.value(),
                        "Slot Already Booked For This Appointment. Please Select Another Free Slot.", resBody);
            } else {
                return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), resBody.get("error").toString(),
                        resBody);
            }
        } catch (Exception e) {
            return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), Constants.ERROR_MSG, resBody);
        }
    }

    @PostMapping("/setAcceptOrRejectAppointment")
    public ApiResponse<?> setAcceptOrRejectAppointment(@RequestBody Map<String, Object> payload) {
        Map<String, Object> resBody = new HashMap<>();
        try {
            resBody = calendarAppointmentService.setAcceptOrRejectAppointment(payload);
            if (resBody.get("error") == null || resBody.get("error").equals("")) {
                String status = payload.get("status") != null ? payload.get("status").toString() : "accept";
                String msg = status.equalsIgnoreCase("accept") ? "Meeting accepted successfully!"
                        : "Meeting rejected successfully!";
                Object dataResult = resBody.get("result") != null ? resBody.get("result") : resBody;
                return new ApiResponse<>(HttpStatus.OK.value(), msg, dataResult);
            } else if ("1".equals(resBody.get("error"))) {
                return new ApiResponse<>(HttpStatus.BAD_REQUEST.value(),
                        "Slot Already Booked For This Meeting. Please Select Another Free Slot.", resBody);
            } else {
                return new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), resBody.get("error").toString(), resBody);
            }
        } catch (Exception e) {
            return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), Constants.ERROR_MSG, resBody);
        }
    }

    @GetMapping("/getEditAppointmentDetails")
    public ApiResponse<?> getEditAppointmentDetails(@RequestParam("id") String id,
            @RequestParam(value = "v", required = false) String v) {
        Map<String, Object> resBody = new HashMap<>();
        try {
            Integer calendarId = null;
            Integer cusId = null;
            try {
                calendarId = Integer.parseInt(new String(Base64.getUrlDecoder().decode(id), StandardCharsets.UTF_8));
            } catch (Exception e) {
                try {
                    calendarId = Integer.parseInt(new String(Base64.getDecoder().decode(id), StandardCharsets.UTF_8));
                } catch (Exception e2) {
                    calendarId = Integer.parseInt(id);
                }
            }
            if (v != null && !v.isEmpty()) {
                try {
                    cusId = Integer.parseInt(new String(Base64.getUrlDecoder().decode(v), StandardCharsets.UTF_8));
                } catch (Exception e) {
                    try {
                        cusId = Integer.parseInt(new String(Base64.getDecoder().decode(v), StandardCharsets.UTF_8));
                    } catch (Exception e2) {
                        cusId = Integer.parseInt(v);
                    }
                }
            }

            resBody = calendarAppointmentService.getEditAppointmentDetails(calendarId, cusId);
            if (resBody.get("error") == null || resBody.get("error").equals("")) {
                Object dataResult = resBody.get("result") != null ? resBody.get("result") : resBody;
                return new ApiResponse<>(HttpStatus.OK.value(), "Appointment details fetched successfully", dataResult);
            } else {
                return new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), resBody.get("error").toString(), resBody);
            }
        } catch (Exception e) {
            return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), Constants.ERROR_MSG, resBody);
        }
    }

    @PostMapping("/updateAppointmentDateTime")
    public ApiResponse<?> updateAppointmentDateTime(@RequestBody Map<String, Object> payload) {
        Map<String, Object> resBody = new HashMap<>();
        try {
            resBody = calendarAppointmentService.updateAppointmentDateTime(payload);
            if (resBody.get("error") == null || resBody.get("error").equals("")) {
                Object dataResult = resBody.get("result") != null ? resBody.get("result") : resBody;
                return new ApiResponse<>(HttpStatus.OK.value(), "Meeting updated successfully!", dataResult);
            } else {
                return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), resBody.get("error").toString(),
                        resBody);
            }
        } catch (Exception e) {
            return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), Constants.ERROR_MSG, resBody);
        }
    }

    @PostMapping("/sendEmailAppointmentLink")
    public ApiResponse<?> sendEmailAppointmentLink(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody SendAppointmentLinkDto sendAppointmentLinkDto) {
        Map<String, Object> resBody = new HashMap<>();
        try {
            resBody = calendarAppointmentService.sendEmailAppointmentLink(sendAppointmentLinkDto);
            if (resBody.get("error").equals("")) {
                return new ApiResponse<>(HttpStatus.OK.value(), "Send Email Successfully.", resBody);
            } else {
                return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), Constants.ERROR_MSG, resBody);
            }
        } catch (Exception e) {
            return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), Constants.ERROR_MSG, resBody);
        }
    }
}

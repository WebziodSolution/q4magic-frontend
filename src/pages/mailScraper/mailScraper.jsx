import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { connect } from "react-redux";
import { setAlert, setLoading } from "../../redux/commonReducers/commonReducers";

import Input from "../../components/common/input/input";
import CustomIcons from "../../components/common/icons/CustomIcons";
import Select from "../../components/common/select/select";
import Button from "../../components/common/buttons/button";
import { createScrapingRequest } from "../../service/emailScrapingRequest/emailScrapingRequest";
import { fetchDNSMXRecords } from "../../service/common/commonService";
import { useLocation } from "react-router-dom";
import { exchangeMicrosoftCode } from "../../service/outlookCalendar/outlookCalendarService";

const MAIL_HOST_MAP = {
    gmail: "imap.gmail.com",
    outlook: "outlook.office365.com",
    yahoo: "imap.mail.yahoo.com",
    zoho: "imap.zoho.com",
};

const PROVIDER_PRESETS = {
    gmail: {
        label: "Gmail",
        protocol: "IMAPS",
        host: "imap.gmail.com",
        port: 993,
        authType: "password",
        docs: "https://support.google.com/mail/answer/7126229",
    },
    outlook: {
        label: "Outlook / Microsoft 365",
        protocol: "GRAPH_API",
        host: "graph.microsoft.com",
        port: 443,
        authType: "oauth2",
        docs: "https://learn.microsoft.com/en-us/graph/api/user-list-messages",
    },
    yahoo: {
        label: "Yahoo Mail",
        protocol: "IMAPS",
        host: "imap.mail.yahoo.com",
        port: 993,
        authType: "password",
        docs: "https://help.yahoo.com/kb/SLN15241.html",
    },
    zoho: {
        label: "Zoho Mail",
        protocol: "IMAPS",
        host: "imap.zoho.com",
        port: 993,
        authType: "password",
        docs: "https://www.zoho.com/mail/help/imap-access.html",
    },
    custom: {
        label: "Custom Domain / Other IMAP",
        protocol: "IMAPS",
        host: "",
        port: 993,
        authType: "password",
        docs: "",
    },
};

const protocols = [
    { id: 1, title: "IMAPS" },
    { id: 2, title: "IMAP" },
    { id: 3, title: "GRAPH_API" },
    { id: 4, title: "POP3S" },
    { id: 5, title: "POP3" },
];

const MS_CLIENT_ID = process.env.REACT_APP_AZURE_CLIENT_ID;

function FieldLabel({ htmlFor, children }) {
    return (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-900 mb-1">
            {children}
        </label>
    );
}

function HelperText({ children }) {
    return <p className="mt-1 text-xs text-gray-500">{children}</p>;
}

function Card({ children, className = "" }) {
    return (
        <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
            {children}
        </div>
    );
}

function CardHeader({ title, subtitle }) {
    return (
        <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
    );
}

function CardBody({ children }) {
    return <div className="p-5">{children}</div>;
}

function Step({ n, title, children }) {
    return (
        <div className="flex gap-3.5 items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#44288E] text-white flex items-center justify-center text-xs font-semibold shadow-sm mt-0.5">
                {n}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{title}</div>
                <div className="mt-1 text-sm text-gray-600 leading-relaxed">{children}</div>
            </div>
        </div>
    );
}

function Accordion({ items, openId: controlledOpenId, onChangeOpenId, selectedPreset, onApplyPreset }) {
    const [uncontrolledOpenId, setUncontrolledOpenId] = useState(items[0]?.id ?? null);
    const openId = controlledOpenId !== undefined ? controlledOpenId : uncontrolledOpenId;

    const toggle = (id) => {
        const next = openId === id ? null : id;
        if (onChangeOpenId) onChangeOpenId(next);
        else setUncontrolledOpenId(next);
        if (onApplyPreset) {
            onApplyPreset(id);
        }
    };

    return (
        <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
            {items.map((it) => (
                <div key={it.id}>
                    <button
                        type="button"
                        className={`w-full text-left px-5 py-4 flex items-center justify-between gap-3 transition ${openId === it.id ? "bg-purple-50/40" : "hover:bg-gray-50"}`}
                        onClick={() => toggle(it.id)}
                        aria-expanded={openId === it.id}
                        aria-controls={`panel-${it.id}`}
                    >
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={`font-medium ${openId === it.id ? "text-[#44288E] font-semibold" : "text-gray-900"}`}>
                                {it.title}
                            </span>
                        </div>
                        <span
                            className={`p-1 rounded-full border flex justify-center items-center 
                            transition-all duration-500 ease-in-out
                            ${openId === it.id ? "rotate-180 bg-[#44288E] border-[#44288E]" : "rotate-0 bg-white border-gray-300"}`}
                        >
                            {openId === it.id ? (
                                <CustomIcons iconName="fa-solid fa-minus" css="text-white w-4 h-4" />
                            ) : (
                                <CustomIcons iconName="fa-solid fa-plus" css="text-black w-4 h-4" />
                            )}
                        </span>
                    </button>
                    <div
                        id={`panel-${it.id}`}
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${openId === it.id ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"}`}
                    >
                        <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
                            {it.content}
                            {selectedPreset !== it.id && onApplyPreset && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => onApplyPreset(it.id)}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#44288E] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition"
                                    >
                                        Apply {it.title} preset to form
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function MailScraper({ setAlert, setLoading }) {
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState("gmail");
    const [openAccordionId, setOpenAccordionId] = useState("gmail");
    const [message, setMessage] = useState(null);
    const [authType, setAuthType] = useState("password");

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
        reset,
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
            refreshToken: "",
            protocol: "IMAPS",
            imap_host: "imap.gmail.com",
            imap_port: 993,
            maxMessages: "50",
        }
    });

    const hostToSection = (host) => {
        const h = (host || "").toLowerCase();
        if (h.includes("gmail.com") || h.includes("google")) return "gmail";
        if (h.includes("office365") || h.includes("outlook") || h.includes("microsoft")) return "outlook";
        if (h.includes("yahoo")) return "yahoo";
        if (h.includes("zoho")) return "zoho";
        return "custom";
    };

    const handleGetMx = async () => {
        const email = watch("email");
        if (!email) return;

        try {
            const res = await fetchDNSMXRecords(email);
            const mxRecords = res?.data || [];
            const mxString = mxRecords.join(" ").toLowerCase();

            let selectedHost = null;
            let detectedPreset = null;
            if (mxString.includes("google") || mxString.includes("gmail")) {
                selectedHost = MAIL_HOST_MAP.gmail;
                detectedPreset = "gmail";
                setAuthType("password");
                setValue("protocol", "IMAPS");
                setValue("imap_port", 993);
            } else if (
                mxString.includes("outlook") ||
                mxString.includes("office365") ||
                mxString.includes("protection.outlook.com")
            ) {
                selectedHost = MAIL_HOST_MAP.outlook;
                detectedPreset = "outlook";
                setAuthType("oauth2");
                setValue("protocol", "GRAPH_API");
                setValue("imap_port", 443);
            } else if (mxString.includes("yahoo")) {
                selectedHost = MAIL_HOST_MAP.yahoo;
                detectedPreset = "yahoo";
                setAuthType("password");
                setValue("protocol", "IMAPS");
                setValue("imap_port", 993);
            } else if (mxString.includes("zoho")) {
                selectedHost = MAIL_HOST_MAP.zoho;
                detectedPreset = "zoho";
                setAuthType("password");
                setValue("protocol", "IMAPS");
                setValue("imap_port", 993);
            }

            if (selectedHost && detectedPreset) {
                setValue("imap_host", selectedHost);
                setSelectedPreset(detectedPreset);
                setOpenAccordionId(detectedPreset);
                setMessage(
                    selectedHost === MAIL_HOST_MAP.outlook
                        ? "Microsoft 365 / Outlook detected. Basic auth is disabled by Microsoft; please sign in with Microsoft OAuth below."
                        : `${PROVIDER_PRESETS[detectedPreset]?.label || "Email provider"} detected and pre-filled below.`
                );
            } else {
                setSelectedPreset("custom");
                setOpenAccordionId("custom");
                setMessage("Could not auto-detect provider. Please fill details manually.");
            }
        } catch (err) {
            console.error("Error fetching MX:", err);
        }
    };

    const onPreset = (key) => {
        const preset = PROVIDER_PRESETS[key];
        if (!preset) return;
        setSelectedPreset(key);
        setValue("protocol", preset.protocol);
        setValue("imap_host", preset.host);
        setValue("imap_port", preset.port);
        setAuthType(preset.authType);
        setOpenAccordionId(key);
        setMessage(null);
    };

    const handleConnectMicrosoft = () => {
        const redirectUri = encodeURIComponent(`${window.location.origin}/outlookcalendaroauthredirect`);
        const scope = encodeURIComponent("https://graph.microsoft.com/Mail.Read offline_access openid profile");

        const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MS_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scope}&state=mail`;

        const width = 600;
        const height = 700;
        const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

        const screenWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.screen.width;
        const screenHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.screen.height;

        const left = Math.round(((screenWidth / 2) - (width / 2)) + dualScreenLeft);
        const top = Math.round(((screenHeight / 2) - (height / 2)) + dualScreenTop);

        const popup = window.open(
            authUrl,
            "Microsoft Auth",
            `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
        );
        if (popup && popup.focus) {
            popup.focus();
        }
    };

    const onSubmit = async (values) => {
        setSubmitting(true);
        setLoading(true);
        const data = {
            email: values.email,
            password: authType === "oauth2" ? values.refreshToken : values.password,
            authType: authType,
            protocol: values.protocol,
            imapHost: values.imap_host,
            imapPort: values.imap_port,
            maxMessages: values.maxMessages,
        };
        try {
            const response = await createScrapingRequest(data);
            if (response?.status !== 201) {
                setLoading(false);
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.message || "Something went wrong while creating scraping request",
                });
            } else {
                setSubmitting(false);
                setLoading(false);
                reset({
                    email: "",
                    password: "",
                    refreshToken: "",
                    protocol: PROVIDER_PRESETS[selectedPreset]?.protocol || "IMAPS",
                    imap_host: PROVIDER_PRESETS[selectedPreset]?.host || "imap.gmail.com",
                    imap_port: PROVIDER_PRESETS[selectedPreset]?.port || 993,
                    maxMessages: "50",
                });
                setAlert({
                    open: true,
                    type: "success",
                    message: response?.message || "Mail scraping request created successfully",
                });
            }
        } catch (e) {
            setLoading(false);
            setAlert({
                open: true,
                type: "error",
                message: e?.response?.data?.detail || e?.message || "Something went wrong",
            });
        } finally {
            setSubmitting(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Method 1: Handle via window.opener function
        window.omSuccess = async ({ code }) => {
            if (!code) return;
            try {
                setLoading(true);
                const redirectUri = `${window.location.origin}/outlookcalendaroauthredirect`;

                // Call Spring Boot API endpoint (/api/oauth/microsoft/exchange)
                const res = await exchangeMicrosoftCode({ code, redirectUri });
                const refreshToken = res?.data?.data?.refreshToken || res?.data?.refreshToken;

                if (refreshToken) {
                    setAlert({ open: true, type: "success", message: "Microsoft account connected successfully!" });

                    // Pre-fill form fields
                    setSelectedPreset("outlook");
                    setOpenAccordionId("outlook");
                    setAuthType("oauth2");
                    setValue("refreshToken", refreshToken);
                    setValue("protocol", "GRAPH_API");
                    setValue("imap_host", "graph.microsoft.com");
                    setValue("imap_port", 443);
                    setMessage("Microsoft account connected! OAuth credentials pre-filled below.");
                } else {
                    setAlert({ open: true, type: "error", message: "Failed to retrieve refresh token from response." });
                }
            } catch (err) {
                setAlert({ open: true, type: "error", message: "Failed to exchange Microsoft OAuth code" });
            } finally {
                setLoading(false);
            }
        };

        window.omError = (err) => {
            setAlert({ open: true, type: "error", message: `Microsoft Auth Failed: ${err || "Unknown error"}` });
        };

        // Method 2: Handle via BroadcastChannel
        const channel = new BroadcastChannel('outlook-mail-oauth');
        channel.onmessage = (event) => {
            if (event.data?.code) {
                window.omSuccess({ code: event.data.code });
            } else if (event.data?.error) {
                window.omError(event.data.error);
            }
        };

        return () => {
            delete window.omSuccess;
            delete window.omError;
            channel.close();
        };
    }, [setAlert, setLoading, setValue]);

    useEffect(() => {
        if (location.state?.refreshToken) {
            setSelectedPreset("outlook");
            setOpenAccordionId("outlook");
            setAuthType("oauth2");
            setValue("protocol", location.state.protocol || "GRAPH_API");
            setValue("imap_host", location.state.imapHost || "graph.microsoft.com");
            setValue("imap_port", location.state.imapPort || 443);
            setValue("refreshToken", location.state.refreshToken);
            if (location.state.email) {
                setValue("email", location.state.email);
            }
            setMessage("Microsoft account connected! Credentials pre-filled below.");
        }
    }, [location.state, setValue]);

    return (
        <div className="my-2">
            <section className="mx-auto max-w-6xl px-4">
                <div className="grid md:grid-cols-2 gap-6 items-stretch">
                    <Card>
                        <CardHeader
                            title="Configure & Send Request"
                            subtitle="Provide mailbox access details using an App Password. We guide you step-by-step for each provider."
                        />
                        <CardBody>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <FieldLabel htmlFor="provider">Quick provider presets</FieldLabel>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(PROVIDER_PRESETS).map(([key, p]) => {
                                            const isSelected = selectedPreset === key;
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => onPreset(key)}
                                                    className={`rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all duration-200 border ${isSelected
                                                        ? "bg-[#44288E] text-white border-[#44288E] shadow-sm ring-2 ring-[#44288E]/20"
                                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                                        }`}
                                                >
                                                    {p.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <Controller
                                        name="email"
                                        control={control}
                                        rules={{
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Email"
                                                type="text"
                                                error={errors?.email?.message}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\s/g, "");
                                                    field.onChange(value);
                                                }}
                                                onBlur={handleGetMx}
                                            />
                                        )}
                                    />
                                    {message && <HelperText>{message}</HelperText>}
                                </div>

                                {authType === "oauth2" ? (
                                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 space-y-3">
                                        <div className="text-sm text-blue-900 font-medium">
                                            Microsoft OAuth 2.0 Required
                                        </div>
                                        <p className="text-xs text-blue-800">
                                            Microsoft basic authentication is disabled. Sign in via Microsoft to grant permission.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleConnectMicrosoft}
                                            className="w-full flex items-center justify-center gap-2 bg-[#2F2F2F] text-white py-2 px-4 rounded-xl text-sm font-medium hover:bg-black transition"
                                        >
                                            <CustomIcons iconName="fa-brands fa-microsoft" css="w-4 h-4" />
                                            Sign in with Microsoft
                                        </button>

                                        <div className="pt-2">
                                            <Controller
                                                name="refreshToken"
                                                control={control}
                                                rules={{ required: authType === "oauth2" ? "OAuth Token / Refresh Token is required" : false }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="OAuth Access Token / Refresh Token"
                                                        type="password"
                                                        error={errors?.refreshToken?.message}
                                                    />
                                                )}
                                            />
                                            <HelperText>Auto-filled after clicking Sign in with Microsoft, or enter manually.</HelperText>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Controller
                                            name="password"
                                            control={control}
                                            rules={{ required: authType === "password" ? "Password is required" : false }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="App Password"
                                                    type={showPassword ? "text" : "password"}
                                                    error={errors?.password?.message}
                                                    endIcon={
                                                        <span
                                                            onClick={() => setShowPassword((s) => !s)}
                                                            style={{ cursor: "pointer", color: "black" }}
                                                        >
                                                            <CustomIcons
                                                                iconName={showPassword ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"}
                                                                css="cursor-pointer text-black"
                                                            />
                                                        </span>
                                                    }
                                                />
                                            )}
                                        />
                                        <HelperText>
                                            Use an <strong>App Password</strong> for Gmail, Yahoo, Zoho, or custom IMAP servers.
                                        </HelperText>
                                    </div>
                                )}

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Controller
                                            name="protocol"
                                            control={control}
                                            rules={{ required: "Protocol is required" }}
                                            render={({ field }) => (
                                                <Select
                                                    options={protocols}
                                                    label="Protocol"
                                                    placeholder="Select protocol"
                                                    value={protocols.find((r) => r.title === watch("protocol"))?.id || null}
                                                    onChange={(_, newValue) => {
                                                        if (newValue?.id) field.onChange(newValue.title);
                                                    }}
                                                    error={errors?.protocol}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <Controller
                                            name="maxMessages"
                                            control={control}
                                            rules={{ required: "Max messages is required" }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Max Messages"
                                                    type="text"
                                                    error={errors?.maxMessages}
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/[^0-9]/g, "");
                                                        field.onChange(numericValue);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2">
                                        <Controller
                                            name="imap_host"
                                            control={control}
                                            rules={{ required: "Host is required" }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Host"
                                                    type="text"
                                                    error={errors?.imap_host}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        field.onChange(v);
                                                        const detected = hostToSection(v);
                                                        setOpenAccordionId(detected);
                                                        setSelectedPreset(detected);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Controller
                                            name="imap_port"
                                            control={control}
                                            rules={{ required: "Port is required" }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Port"
                                                    type="text"
                                                    error={errors?.imap_port}
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/[^0-9]/g, "");
                                                        field.onChange(numericValue);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <span className="text-xs text-gray-500 grow">
                                        Reading last {watch("maxMessages") || "N"} messages.
                                    </span>
                                    <div>
                                        <Button isLoading={submitting} disabled={submitting} type="submit" text="Send Request" />
                                    </div>
                                </div>
                            </form>
                        </CardBody>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader
                                title="Provider Setup Instructions"
                                subtitle="Follow these step-by-step guides to generate app credentials and enable IMAP access."
                            />
                            <CardBody>
                                <Accordion
                                    openId={openAccordionId}
                                    // onChangeOpenId={setOpenAccordionId}
                                    selectedPreset={selectedPreset}
                                    onApplyPreset={onPreset}
                                    items={[
                                        {
                                            id: "gmail",
                                            title: "Gmail",
                                            content: (
                                                <div className="space-y-4">
                                                    <Step n={1} title="Enable 2-Step Verification">
                                                        Google requires 2-Step Verification before creating an App Password.
                                                        Go to{" "}
                                                        <a
                                                            href="https://myaccount.google.com/security"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[#44288E] hover:underline font-medium inline-flex items-center gap-1"
                                                        >
                                                            Google Account Security{" "}
                                                            <CustomIcons iconName="fa-solid fa-arrow-up-right-from-square" css="text-[10px]" />
                                                        </a>{" "}
                                                        and ensure <strong>2-Step Verification</strong> is turned <strong>ON</strong>.
                                                    </Step>
                                                    <Step n={2} title="Generate an App Password">
                                                        Go directly to{" "}
                                                        <a
                                                            href="https://myaccount.google.com/apppasswords"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[#44288E] hover:underline font-medium inline-flex items-center gap-1"
                                                        >
                                                            Google App Passwords{" "}
                                                            <CustomIcons iconName="fa-solid fa-arrow-up-right-from-square" css="text-[10px]" />
                                                        </a>
                                                        . Under &quot;App name&quot;, enter <em>360pipe Mail Scraper</em> and click <strong>Create</strong>. Copy the 16-character password and paste it into the <strong>App Password</strong> field on the left.
                                                    </Step>
                                                    <Step n={3} title="Enable IMAP in Gmail Settings">
                                                        Open{" "}
                                                        <a
                                                            href="https://mail.google.com/mail/u/0/#settings/fwdandpop"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[#44288E] hover:underline font-medium inline-flex items-center gap-1"
                                                        >
                                                            Gmail Settings (Forwarding and POP/IMAP){" "}
                                                            <CustomIcons iconName="fa-solid fa-arrow-up-right-from-square" css="text-[10px]" />
                                                        </a>
                                                        , select <strong>Enable IMAP</strong>, and click <strong>Save Changes</strong> at the bottom.
                                                    </Step>
                                                    <Step n={4} title="Server & Port Settings">
                                                        Protocol: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">IMAPS</span> | Host: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">imap.gmail.com</span> | Port: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">993</span>
                                                    </Step>
                                                </div>
                                            ),
                                        },
                                        {
                                            id: "outlook",
                                            title: "Outlook / Microsoft 365 (Any Org / Personal)",
                                            content: (
                                                <div className="space-y-4">
                                                    <Step n={1} title="Why App Passwords Don't Work">
                                                        Microsoft permanently turned off Basic Authentication (passwords and app passwords) for IMAP in Exchange Online and Outlook.com.
                                                    </Step>
                                                    <Step n={2} title="Use Modern Auth (OAuth 2.0)">
                                                        Click the <strong>Sign in with Microsoft</strong> button on the left. A secure Microsoft OAuth popup will open allowing personal Outlook/Hotmail and work/school Microsoft 365 accounts to authorize access safely.
                                                    </Step>
                                                    <Step n={3} title="Automatic Configuration">
                                                        Once granted, your OAuth token, protocol (<span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">GRAPH_API</span>), host (<span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">graph.microsoft.com</span>), and port (<span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">443</span>) are automatically pre-filled.
                                                    </Step>
                                                </div>
                                            ),
                                        },
                                        {
                                            id: "yahoo",
                                            title: "Yahoo Mail",
                                            content: (
                                                <div className="space-y-4">
                                                    <Step n={1} title="Open Yahoo Account Security">
                                                        Sign in to your Yahoo account and go to{" "}
                                                        <a
                                                            href="https://login.yahoo.com/account/security"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[#44288E] hover:underline font-medium inline-flex items-center gap-1"
                                                        >
                                                            Yahoo Account Security{" "}
                                                            <CustomIcons iconName="fa-solid fa-arrow-up-right-from-square" css="text-[10px]" />
                                                        </a>
                                                        .
                                                    </Step>
                                                    <Step n={2} title="Generate an App Password">
                                                        Scroll down to <strong>App passwords</strong> and click <strong>Generate app password</strong> (or <em>Generate and manage app passwords</em>). Enter an app name (e.g. <em>360pipe</em>) and click <strong>Generate password</strong>.
                                                    </Step>
                                                    <Step n={3} title="Enter in the Form">
                                                        Copy the generated 16-character password and paste it into the <strong>App Password</strong> field on the left.
                                                    </Step>
                                                    <Step n={4} title="Server & Port Settings">
                                                        Protocol: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">IMAPS</span> | Host: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">imap.mail.yahoo.com</span> | Port: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">993</span>
                                                    </Step>
                                                </div>
                                            ),
                                        },
                                        {
                                            id: "zoho",
                                            title: "Zoho Mail",
                                            content: (
                                                <div className="space-y-4">
                                                    <Step n={1} title="Enable IMAP Access in Zoho">
                                                        Log in to{" "}
                                                        <a
                                                            href="https://mail.zoho.com"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[#44288E] hover:underline font-medium inline-flex items-center gap-1"
                                                        >
                                                            Zoho Mail{" "}
                                                            <CustomIcons iconName="fa-solid fa-arrow-up-right-from-square" css="text-[10px]" />
                                                        </a>
                                                        , click the <strong>Settings (gear icon)</strong> → <strong>Mail Accounts</strong> → select your account, and under <strong>IMAP Access</strong> check <strong>Enable IMAP</strong>.
                                                    </Step>
                                                    <Step n={2} title="Generate an App Password">
                                                        Go to{" "}
                                                        <a
                                                            href="https://accounts.zoho.com/#security/app_password"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[#44288E] hover:underline font-medium inline-flex items-center gap-1"
                                                        >
                                                            Zoho Security App Passwords{" "}
                                                            <CustomIcons iconName="fa-solid fa-arrow-up-right-from-square" css="text-[10px]" />
                                                        </a>
                                                        . Click <strong>Generate New Password</strong>, enter an application name, and copy the generated password into the <strong>App Password</strong> field.
                                                    </Step>
                                                    <Step n={3} title="Server & Port Settings">
                                                        Protocol: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">IMAPS</span> | Host: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">imap.zoho.com</span> (or <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">imap.zoho.eu</span> for EU) | Port: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">993</span>
                                                    </Step>
                                                </div>
                                            ),
                                        },
                                        {
                                            id: "custom",
                                            title: "Custom Domain / Other IMAP",
                                            content: (
                                                <div className="space-y-4">
                                                    <Step n={1} title="Find Incoming Mail Server Details">
                                                        Check your hosting cPanel, Plesk, Hostinger, GoDaddy, or contact your mail administrator to find your incoming mail server (IMAP) hostname.
                                                    </Step>
                                                    <Step n={2} title="Configure SSL/TLS Settings">
                                                        Use protocol <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">IMAPS</span> with Port <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">993</span> (SSL/TLS encrypted, recommended). For standard unencrypted or STARTTLS, use Port <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">143</span>.
                                                    </Step>
                                                    <Step n={3} title="Credentials">
                                                        Enter your full email address in the <strong>Email</strong> field and your mailbox password (or host app password) in the <strong>App Password</strong> field.
                                                    </Step>
                                                </div>
                                            ),
                                        },
                                    ]}
                                    onChangeOpenId={(id) => {
                                        setOpenAccordionId(id);
                                        if (id && PROVIDER_PRESETS[id]) {
                                            setSelectedPreset(id);
                                        }
                                    }}
                                />
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
}

const mapDispatchToProps = {
    setAlert,
    setLoading
};

export default connect(null, mapDispatchToProps)(MailScraper);
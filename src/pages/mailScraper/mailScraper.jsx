import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { connect } from "react-redux";
import { setAlert, setLoading } from "../../redux/commonReducers/commonReducers";

import Input from "../../components/common/input/input";
import CustomIcons from "../../components/common/icons/CustomIcons";
import Select from "../../components/common/select/select";
import Button from "../../components/common/buttons/button";
import { createScrapingRequest } from "../../service/emailScrapingRequest/emailScrapingRequest";
import { fetchDNSMXRecords } from "../../service/common/commonService";

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
        docs: "https://support.google.com/mail/answer/7126229",
    },
    outlook: {
        label: "Outlook / Microsoft 365",
        protocol: "IMAPS",
        host: "outlook.office365.com",
        port: 993,
        docs: "https://support.microsoft.com/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b692-2c284e85ed25",
    },
    yahoo: {
        label: "Yahoo Mail",
        protocol: "IMAPS",
        host: "imap.mail.yahoo.com",
        port: 993,
        docs: "https://help.yahoo.com/kb/SLN15241.html",
    },
    zoho: {
        label: "Zoho Mail",
        protocol: "IMAPS",
        host: "imap.zoho.com",
        port: 993,
        docs: "https://www.zoho.com/mail/help/imap-access.html",
    },
    custom: {
        label: "Custom Domain / Other IMAP",
        protocol: "IMAPS",
        host: "",
        port: 993,
        docs: "",
    },
};

const protocols = [
    {
        id: 1,
        title: "IMAPS",
    },
    {
        id: 2,
        title: "IMAP",
    },
    {
        id: 3,
        title: "POP3S",
    },
    {
        id: 4,
        title: "POP3",
    }
]

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
        <div className="flex gap-4">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
                {n}
            </div>
            <div>
                <div className="font-medium text-gray-900">{title}</div>
                <div className="mt-2 text-sm text-gray-700 leading-relaxed">{children}</div>
            </div>
        </div>
    );
}

function Accordion({ items, openId: controlledOpenId, onChangeOpenId }) {
    const [uncontrolledOpenId, setUncontrolledOpenId] = useState(items[0]?.id ?? null);
    const openId = controlledOpenId ?? uncontrolledOpenId;

    const toggle = (id) => {
        const next = openId === id ? null : id;
        if (onChangeOpenId) onChangeOpenId(next);
        else setUncontrolledOpenId(next);
    };

    return (
        <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
            {items.map((it) => (
                <div key={it.id}>
                    <button
                        type="button"
                        className={`w-full text-left px-5 py-4 flex items-center justify-between gap-3 transition ${openId === it.id ? "bg-gray-50" : "hover:bg-gray-50"}`}
                        onClick={() => toggle(it.id)}
                        aria-expanded={openId === it.id}
                        aria-controls={`panel-${it.id}`}
                    >
                        <span className="font-medium text-gray-900">{it.title}</span>
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
                        className={`overflow-hidden transition-all duration-700 ease-in-out ${openId === it.id ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
                    >
                        <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">{it.content}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function MailScraper({ setAlert, setLoading }) {
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [openAccordionId, setOpenAccordionId] = useState(null); // NEW
    const [message, setMessage] = useState(null);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
        reset,
    } = useForm({
        defaultValues: {
            email: null,
            password: null,
            protocol: "IMAPS",
            imap_host: null,
            imap_port: 993,
            maxMessages: null,
        }
    });

    // Map well-known hosts to accordion section ids
    const hostToSection = (host) => {
        const h = (host || "").toLowerCase();
        if (h.includes("gmail.com")) return "gmail";
        if (h.includes("google")) return "gmail";
        if (h.includes("office365") || h.includes("outlook")) return "outlook";
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
            if (mxString.includes("google") || mxString.includes("gmail")) {
                selectedHost = MAIL_HOST_MAP.gmail;
            } else if (
                mxString.includes("outlook") ||
                mxString.includes("office365") ||
                mxString.includes("protection.outlook.com")
            ) {
                selectedHost = MAIL_HOST_MAP.outlook;
            } else if (mxString.includes("yahoo")) {
                selectedHost = MAIL_HOST_MAP.yahoo;
            } else if (mxString.includes("zoho")) {
                selectedHost = MAIL_HOST_MAP.zoho;
            }

            if (selectedHost) {
                setValue("imap_host", selectedHost);
                setOpenAccordionId(hostToSection(selectedHost)); // NEW: open correct accordion
                setMessage("We detected your email provider and it is pre-filled below IMAP / POP Host field. If you don't have app password, please select the appropriate provider from the Provider Setup Instructions.");
            } else {
                setOpenAccordionId("custom");
                setMessage("We could not detect your email provider. Please refer to the Provider Setup Instructions for custom domains to manually fill in the IMAP / POP Host details.");
            }
        } catch (err) {
            console.error("Error fetching MX:", err);
        }
    };

    const onPreset = (key) => {
        const preset = PROVIDER_PRESETS[key];
        if (!preset) return;
        setValue("protocol", preset.protocol);
        setValue("imap_host", preset.host);
        setValue("imap_port", preset.port);
        setOpenAccordionId(key === "outlook" ? "outlook" : key === "gmail" ? "gmail" : key === "yahoo" ? "yahoo" : key === "zoho" ? "zoho" : "custom"); // NEW
    };

    const onSubmit = async (values) => {
        setSubmitting(true);
        setLoading(true);
        const data = {
            email: values.email,
            password: values.password,
            protocol: values.protocol,
            imapHost: values.imap_host,
            imapPort: values.imap_port,
            maxMessages: values.maxMessages,
        }
        try {
            const response = await createScrapingRequest(data);
            if (response?.status !== 201) {
                setLoading(false);
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.message || "Something went wrong while creating scraping request",
                })
            } else {
                setSubmitting(false);
                setLoading(false);
                reset({
                    email: null,
                    password: null,
                    protocol: "IMAPS",
                    imap_host: null,
                    imap_port: 993,
                    maxMessages: null,
                })
                setAlert({
                    open: true,
                    type: "success",
                    message: response?.message || "Mail scraping request created successfully",
                })
            }
        } catch (e) {
            setLoading(false);
            setAlert({
                open: true,
                type: "error",
                message: e?.response?.data?.detail || e?.message || "Something went wrong",
            })
        } finally {
            setSubmitting(false);
            setLoading(false);
        }
    };


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
                                {/* Provider Presets */}
                                <div>
                                    <FieldLabel htmlFor="provider">Quick provider presets</FieldLabel>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(PROVIDER_PRESETS).map(([key, p]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => onPreset(key)}
                                                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
                                                aria-label={`Use ${p.label} preset`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                    <HelperText>
                                        Click a provider to auto-fill <strong>protocol</strong>, <strong>IMAP host</strong> and
                                        <strong> port</strong>. Verify details before submitting.
                                    </HelperText>
                                </div>

                                {/* Email */}
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
                                                type={`text`}
                                                error={errors?.email}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\s/g, "");
                                                    field.onChange(value);
                                                }}
                                                onBlur={() => {
                                                    handleGetMx();
                                                }}
                                            />
                                        )}
                                    />
                                    <HelperText>
                                        {message}
                                    </HelperText>
                                </div>

                                {/* Password / App Password */}
                                <div>
                                    <div className="relative">
                                        <Controller
                                            name="password"
                                            control={control}
                                            rules={{
                                                required: "Password is required",
                                                // minLength: { value: 16, message: "Must be at least 16 characters" },
                                                // maxLength: { value: 16, message: "Must be at most 16 characters" },
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="App Password"
                                                    type={showPassword ? "text" : "password"}
                                                    error={errors?.password?.message}
                                                    onChange={(e) => {
                                                        field.onChange(e.target.value);
                                                    }}
                                                    endIcon={
                                                        <span
                                                            onClick={() => setShowPassword((s) => !s)}
                                                            style={{ cursor: "pointer", color: "black" }}
                                                        >
                                                            {showPassword ? (
                                                                <CustomIcons iconName="fa-solid fa-eye" css="cursor-pointer text-black" />
                                                            ) : (
                                                                <CustomIcons iconName="fa-solid fa-eye-slash" css="cursor-pointer text-black" />
                                                            )}
                                                        </span>
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <HelperText>
                                        For Gmail, Yahoo, Outlook, and many providers, use an <strong>App Password</strong> instead of your
                                        regular password.
                                    </HelperText>
                                </div>

                                {/* Protocol */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Controller
                                            name="protocol"
                                            control={control}
                                            rules={{
                                                required: "Protocol is required"
                                            }}
                                            render={({ field }) => (
                                                <Select
                                                    options={protocols}
                                                    label={"Protocol"}
                                                    placeholder="Select protocol"
                                                    value={protocols?.filter((row) => row.title === watch("protocol"))?.[0]?.id || null}
                                                    onChange={(_, newValue) => {
                                                        if (newValue?.id) {
                                                            field.onChange(newValue.title);
                                                        } else {
                                                            setValue("protocol", null);
                                                        }
                                                    }}
                                                    error={errors?.protocol}
                                                />
                                            )}
                                        />
                                        <HelperText>IMAPS on port 993 is typical for most providers.</HelperText>
                                    </div>

                                    {/* Max Messages */}
                                    <div>
                                        <Controller
                                            name="maxMessages"
                                            control={control}
                                            rules={{
                                                required: "Max messages is required",
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Max Messages"
                                                    type={`text`}
                                                    error={errors?.maxMessages}
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                        field.onChange(numericValue);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Host & Port */}
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2">
                                        <Controller
                                            name="imap_host"
                                            control={control}
                                            rules={{
                                                required: "IMAP / POP Host is required",
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="IMAP / POP Host"
                                                    type={`text`}
                                                    error={errors?.imap_host}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        field.onChange(v);
                                                        setOpenAccordionId(hostToSection(v)); // NEW: react to manual typing
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Controller
                                            name="imap_port"
                                            control={control}
                                            rules={{
                                                required: "IMAP / POP Port is required",
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="IMAP / POP Port"
                                                    type={`text`}
                                                    error={errors?.imap_port}
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                        field.onChange(numericValue);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex items-center gap-3 pt-2">
                                    <span className="text-xs text-gray-500 grow">We only read the last {watch("maxMessages") || "N"} messages you specify.</span>
                                    <div>
                                        <Button isLoading={submitting} disabled={submitting} type="submit" text={"Send Request"} />
                                    </div>
                                </div>
                            </form>
                        </CardBody>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader title="Provider Setup Instructions" />
                            <CardBody>
                                <Accordion
                                    items={[
                                        {
                                            id: "gmail",
                                            title: "Gmail",
                                            content: (
                                                <div className="space-y-4">
                                                    <Step n={1} title="Create an App Password">
                                                        Go to <a className="underline" href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">Google Account Security</a> → <strong>App passwords</strong>. Use the generated password above.
                                                    </Step>
                                                    <Step n={2} title="Enable IMAP">
                                                        In Gmail settings, under <strong>Forwarding and POP/IMAP</strong>, enable IMAP.
                                                    </Step>
                                                    <Step n={3} title="Fill the form">
                                                        Host <code className="px-1 py-0.5 rounded bg-gray-100">imap.gmail.com</code>, port <code className="px-1 py-0.5 rounded bg-gray-100">993</code>, protocol <strong>IMAPS</strong>.
                                                    </Step>
                                                </div>
                                            ),
                                        },
                                        {
                                            id: "outlook",
                                            title: "Outlook / Microsoft 365",
                                            content: (
                                                <div className="space-y-4">
                                                    <Step n={1} title="App Password (if org policy requires)">
                                                        If your tenant enforces MFA, create an <strong>App Password</strong> from <em>My Account → Security info</em> or ask your admin to allow IMAP with app passwords.
                                                    </Step>
                                                    <Step n={2} title="Enable IMAP on the mailbox">
                                                        In Microsoft 365 admin center, ensure IMAP is enabled for the user (Account → Mail → Email apps → IMAP).
                                                    </Step>
                                                    <Step n={3} title="Fill the form">
                                                        Host <code className="px-1 py-0.5 rounded bg-gray-100">outlook.office365.com</code>, port <code className="px-1 py-0.5 rounded bg-gray-100">993</code>, protocol <strong>IMAPS</strong>.
                                                    </Step>
                                                </div>
                                            ),
                                        },
                                        {
                                            id: "yahoo",
                                            title: "Yahoo Mail",
                                            content: (
                                                <div className="space-y-4">
                                                    <Step n={1} title="Create an App Password">
                                                        Go to <a className="underline" href="https://login.yahoo.com/account/security" target="_blank" rel="noreferrer">Yahoo Account Security</a> → <strong>Generate app password</strong>. Choose "Other app" and name it. Use the generated password above.
                                                    </Step>
                                                    <Step n={2} title="Enable IMAP (usually on)">
                                                        Yahoo IMAP is typically enabled by default.
                                                    </Step>
                                                    <Step n={3} title="Fill the form">
                                                        Host <code className="px-1 py-0.5 rounded bg-gray-100">imap.mail.yahoo.com</code>, port <code className="px-1 py-0.5 rounded bg-gray-100">993</code>, protocol <strong>IMAPS</strong>.
                                                    </Step>
                                                </div>
                                            ),
                                        },
                                        {
                                            id: "custom",
                                            title: "Custom domain (cPanel, ISP, or other IMAP/POP)",
                                            content: (
                                                <div className="space-y-4">
                                                    <Step n={1} title="Check your provider docs">
                                                        Search for "IMAP settings" for your domain host (e.g., cPanel: often <code className="px-1 py-0.5 rounded bg-gray-100">mail.yourdomain.com</code> or <code className="px-1 py-0.5 rounded bg-gray-100">imap.yourdomain.com</code>, port <code className="px-1 py-0.5 rounded bg-gray-100">993</code> for SSL).
                                                    </Step>
                                                    <Step n={2} title="App Password / Auth method">
                                                        If MFA is enabled, create an app password. Otherwise, use your mailbox password. Prefer SSL-enabled protocols (<strong>IMAPS</strong>/<strong>POP3S</strong>).
                                                    </Step>
                                                    <Step n={3} title="Verify firewall & security">
                                                        Ensure your server allows remote IMAP/POP connections and your account isn’t limited to specific IPs.
                                                    </Step>
                                                </div>
                                            ),
                                        },
                                    ]}
                                    openId={openAccordionId}                 // NEW
                                    onChangeOpenId={setOpenAccordionId}      // NEW
                                />
                            </CardBody>
                        </Card>
                        <Card>
                            <CardHeader title="Note" />
                            <CardBody>
                                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                                    <li>
                                        All retrieved email data is stored in a <strong>secure temporary environment</strong> and is
                                        automatically <strong>removed after 3 days</strong>.
                                    </li>
                                    <li>
                                        To retain any information, please <strong>add the extracted email addresses</strong> to your
                                        contact list manually before the deletion period.
                                    </li>
                                    <li>
                                        Once the data is added to your contacts, it will be <strong>permanently
                                            removed</strong> from temporary storage.
                                    </li>
                                </ul>
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

export default connect(null, mapDispatchToProps)(MailScraper)
'use client'

import { createUserWithFamily, updateUserWithFamily } from "@/actions/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users, Plus, Trash2, CalendarIcon, Info } from "lucide-react"
import ImageUpload from "@/components/ui/image-upload"

// Full list of country codes
const COUNTRY_CODES = [
    { code: "+93", label: "Afghanistan (+93)" },
    { code: "+355", label: "Albania (+355)" },
    { code: "+213", label: "Algeria (+213)" },
    { code: "+1-684", label: "American Samoa (+1-684)" },
    { code: "+376", label: "Andorra (+376)" },
    { code: "+244", label: "Angola (+244)" },
    { code: "+1-264", label: "Anguilla (+1-264)" },
    { code: "+672", label: "Antarctica (+672)" },
    { code: "+1-268", label: "Antigua and Barbuda (+1-268)" },
    { code: "+54", label: "Argentina (+54)" },
    { code: "+374", label: "Armenia (+374)" },
    { code: "+297", label: "Aruba (+297)" },
    { code: "+61", label: "Australia (+61)" },
    { code: "+43", label: "Austria (+43)" },
    { code: "+994", label: "Azerbaijan (+994)" },
    { code: "+1-242", label: "Bahamas (+1-242)" },
    { code: "+973", label: "Bahrain (+973)" },
    { code: "+880", label: "Bangladesh (+880)" },
    { code: "+1-246", label: "Barbados (+1-246)" },
    { code: "+375", label: "Belarus (+375)" },
    { code: "+32", label: "Belgium (+32)" },
    { code: "+501", label: "Belize (+501)" },
    { code: "+229", label: "Benin (+229)" },
    { code: "+1-441", label: "Bermuda (+1-441)" },
    { code: "+975", label: "Bhutan (+975)" },
    { code: "+591", label: "Bolivia (+591)" },
    { code: "+387", label: "Bosnia and Herzegovina (+387)" },
    { code: "+267", label: "Botswana (+267)" },
    { code: "+55", label: "Brazil (+55)" },
    { code: "+246", label: "British Indian Ocean Territory (+246)" },
    { code: "+1-284", label: "British Virgin Islands (+1-284)" },
    { code: "+673", label: "Brunei (+673)" },
    { code: "+359", label: "Bulgaria (+359)" },
    { code: "+226", label: "Burkina Faso (+226)" },
    { code: "+257", label: "Burundi (+257)" },
    { code: "+855", label: "Cambodia (+855)" },
    { code: "+237", label: "Cameroon (+237)" },
    { code: "+1", label: "Canada (+1)" },
    { code: "+238", label: "Cape Verde (+238)" },
    { code: "+1-345", label: "Cayman Islands (+1-345)" },
    { code: "+236", label: "Central African Republic (+236)" },
    { code: "+235", label: "Chad (+235)" },
    { code: "+56", label: "Chile (+56)" },
    { code: "+86", label: "China (+86)" },
    { code: "+61", label: "Christmas Island (+61)" },
    { code: "+61", label: "Cocos (Keeling) Islands (+61)" },
    { code: "+57", label: "Colombia (+57)" },
    { code: "+269", label: "Comoros (+269)" },
    { code: "+242", label: "Congo (+242)" },
    { code: "+243", label: "Congo, Democratic Republic of the (+243)" },
    { code: "+682", label: "Cook Islands (+682)" },
    { code: "+506", label: "Costa Rica (+506)" },
    { code: "+385", label: "Croatia (+385)" },
    { code: "+53", label: "Cuba (+53)" },
    { code: "+599", label: "Curacao (+599)" },
    { code: "+357", label: "Cyprus (+357)" },
    { code: "+420", label: "Czech Republic (+420)" },
    { code: "+45", label: "Denmark (+45)" },
    { code: "+253", label: "Djibouti (+253)" },
    { code: "+1-767", label: "Dominica (+1-767)" },
    { code: "+1-809, +1-829, +1-849", label: "Dominican Republic (+1-809)" },
    { code: "+670", label: "East Timor (+670)" },
    { code: "+593", label: "Ecuador (+593)" },
    { code: "+20", label: "Egypt (+20)" },
    { code: "+503", label: "El Salvador (+503)" },
    { code: "+240", label: "Equatorial Guinea (+240)" },
    { code: "+291", label: "Eritrea (+291)" },
    { code: "+372", label: "Estonia (+372)" },
    { code: "+251", label: "Ethiopia (+251)" },
    { code: "+500", label: "Falkland Islands (+500)" },
    { code: "+298", label: "Faroe Islands (+298)" },
    { code: "+679", label: "Fiji (+679)" },
    { code: "+358", label: "Finland (+358)" },
    { code: "+33", label: "France (+33)" },
    { code: "+689", label: "French Polynesia (+689)" },
    { code: "+241", label: "Gabon (+241)" },
    { code: "+220", label: "Gambia (+220)" },
    { code: "+995", label: "Georgia (+995)" },
    { code: "+49", label: "Germany (+49)" },
    { code: "+233", label: "Ghana (+233)" },
    { code: "+350", label: "Gibraltar (+350)" },
    { code: "+30", label: "Greece (+30)" },
    { code: "+299", label: "Greenland (+299)" },
    { code: "+1-473", label: "Grenada (+1-473)" },
    { code: "+1-671", label: "Guam (+1-671)" },
    { code: "+502", label: "Guatemala (+502)" },
    { code: "+44-1481", label: "Guernsey (+44-1481)" },
    { code: "+224", label: "Guinea (+224)" },
    { code: "+245", label: "Guinea-Bissau (+245)" },
    { code: "+592", label: "Guyana (+592)" },
    { code: "+509", label: "Haiti (+509)" },
    { code: "+504", label: "Honduras (+504)" },
    { code: "+852", label: "Hong Kong (+852)" },
    { code: "+36", label: "Hungary (+36)" },
    { code: "+354", label: "Iceland (+354)" },
    { code: "+91", label: "India (+91)" },
    { code: "+62", label: "Indonesia (+62)" },
    { code: "+98", label: "Iran (+98)" },
    { code: "+964", label: "Iraq (+964)" },
    { code: "+353", label: "Ireland (+353)" },
    { code: "+44-1624", label: "Isle of Man (+44-1624)" },
    { code: "+972", label: "Israel (+972)" },
    { code: "+39", label: "Italy (+39)" },
    { code: "+225", label: "Ivory Coast (+225)" },
    { code: "+1-876", label: "Jamaica (+1-876)" },
    { code: "+81", label: "Japan (+81)" },
    { code: "+44-1534", label: "Jersey (+44-1534)" },
    { code: "+962", label: "Jordan (+962)" },
    { code: "+7", label: "Kazakhstan (+7)" },
    { code: "+254", label: "Kenya (+254)" },
    { code: "+686", label: "Kiribati (+686)" },
    { code: "+383", label: "Kosovo (+383)" },
    { code: "+965", label: "Kuwait (+965)" },
    { code: "+996", label: "Kyrgyzstan (+996)" },
    { code: "+856", label: "Laos (+856)" },
    { code: "+371", label: "Latvia (+371)" },
    { code: "+961", label: "Lebanon (+961)" },
    { code: "+266", label: "Lesotho (+266)" },
    { code: "+231", label: "Liberia (+231)" },
    { code: "+218", label: "Libya (+218)" },
    { code: "+423", label: "Liechtenstein (+423)" },
    { code: "+370", label: "Lithuania (+370)" },
    { code: "+352", label: "Luxembourg (+352)" },
    { code: "+853", label: "Macau (+853)" },
    { code: "+389", label: "North Macedonia (+389)" },
    { code: "+261", label: "Madagascar (+261)" },
    { code: "+265", label: "Malawi (+265)" },
    { code: "+60", label: "Malaysia (+60)" },
    { code: "+960", label: "Maldives (+960)" },
    { code: "+223", label: "Mali (+223)" },
    { code: "+356", label: "Malta (+356)" },
    { code: "+692", label: "Marshall Islands (+692)" },
    { code: "+222", label: "Mauritania (+222)" },
    { code: "+230", label: "Mauritius (+230)" },
    { code: "+262", label: "Mayotte (+262)" },
    { code: "+52", label: "Mexico (+52)" },
    { code: "+691", label: "Micronesia (+691)" },
    { code: "+373", label: "Moldova (+373)" },
    { code: "+377", label: "Monaco (+377)" },
    { code: "+976", label: "Mongolia (+976)" },
    { code: "+382", label: "Montenegro (+382)" },
    { code: "+1-664", label: "Montserrat (+1-664)" },
    { code: "+212", label: "Morocco (+212)" },
    { code: "+258", label: "Mozambique (+258)" },
    { code: "+95", label: "Myanmar (+95)" },
    { code: "+264", label: "Namibia (+264)" },
    { code: "+674", label: "Nauru (+674)" },
    { code: "+977", label: "Nepal (+977)" },
    { code: "+31", label: "Netherlands (+31)" },
    { code: "+599", label: "Netherlands Antilles (+599)" },
    { code: "+687", label: "New Caledonia (+687)" },
    { code: "+64", label: "New Zealand (+64)" },
    { code: "+505", label: "Nicaragua (+505)" },
    { code: "+227", label: "Niger (+227)" },
    { code: "+234", label: "Nigeria (+234)" },
    { code: "+683", label: "Niue (+683)" },
    { code: "+850", label: "North Korea (+850)" },
    { code: "+1-670", label: "Northern Mariana Islands (+1-670)" },
    { code: "+47", label: "Norway (+47)" },
    { code: "+968", label: "Oman (+968)" },
    { code: "+92", label: "Pakistan (+92)" },
    { code: "+680", label: "Palau (+680)" },
    { code: "+970", label: "Palestine (+970)" },
    { code: "+507", label: "Panama (+507)" },
    { code: "+675", label: "Papua New Guinea (+675)" },
    { code: "+595", label: "Paraguay (+595)" },
    { code: "+51", label: "Peru (+51)" },
    { code: "+63", label: "Philippines (+63)" },
    { code: "+64", label: "Pitcairn (+64)" },
    { code: "+48", label: "Poland (+48)" },
    { code: "+351", label: "Portugal (+351)" },
    { code: "+1-787, +1-939", label: "Puerto Rico (+1-787)" },
    { code: "+974", label: "Qatar (+974)" },
    { code: "+242", label: "Republic of the Congo (+242)" },
    { code: "+262", label: "Reunion (+262)" },
    { code: "+40", label: "Romania (+40)" },
    { code: "+7", label: "Russia (+7)" },
    { code: "+250", label: "Rwanda (+250)" },
    { code: "+590", label: "Saint Barthelemy (+590)" },
    { code: "+290", label: "Saint Helena (+290)" },
    { code: "+1-869", label: "Saint Kitts and Nevis (+1-869)" },
    { code: "+1-758", label: "Saint Lucia (+1-758)" },
    { code: "+590", label: "Saint Martin (+590)" },
    { code: "+508", label: "Saint Pierre and Miquelon (+508)" },
    { code: "+1-784", label: "Saint Vincent and the Grenadines (+1-784)" },
    { code: "+685", label: "Samoa (+685)" },
    { code: "+378", label: "San Marino (+378)" },
    { code: "+239", label: "Sao Tome and Principe (+239)" },
    { code: "+966", label: "Saudi Arabia (+966)" },
    { code: "+221", label: "Senegal (+221)" },
    { code: "+381", label: "Serbia (+381)" },
    { code: "+248", label: "Seychelles (+248)" },
    { code: "+232", label: "Sierra Leone (+232)" },
    { code: "+65", label: "Singapore (+65)" },
    { code: "+1-721", label: "Sint Maarten (+1-721)" },
    { code: "+421", label: "Slovakia (+421)" },
    { code: "+386", label: "Slovenia (+386)" },
    { code: "+677", label: "Solomon Islands (+677)" },
    { code: "+252", label: "Somalia (+252)" },
    { code: "+27", label: "South Africa (+27)" },
    { code: "+82", label: "South Korea (+82)" },
    { code: "+211", label: "South Sudan (+211)" },
    { code: "+34", label: "Spain (+34)" },
    { code: "+94", label: "Sri Lanka (+94)" },
    { code: "+249", label: "Sudan (+249)" },
    { code: "+597", label: "Suriname (+597)" },
    { code: "+47", label: "Svalbard and Jan Mayen (+47)" },
    { code: "+268", label: "Swaziland (+268)" },
    { code: "+46", label: "Sweden (+46)" },
    { code: "+41", label: "Switzerland (+41)" },
    { code: "+963", label: "Syria (+963)" },
    { code: "+886", label: "Taiwan (+886)" },
    { code: "+992", label: "Tajikistan (+992)" },
    { code: "+255", label: "Tanzania (+255)" },
    { code: "+66", label: "Thailand (+66)" },
    { code: "+228", label: "Togo (+228)" },
    { code: "+690", label: "Tokelau (+690)" },
    { code: "+676", label: "Tonga (+676)" },
    { code: "+1-868", label: "Trinidad and Tobago (+1-868)" },
    { code: "+216", label: "Tunisia (+216)" },
    { code: "+90", label: "Turkey (+90)" },
    { code: "+993", label: "Turkmenistan (+993)" },
    { code: "+1-649", label: "Turks and Caicos Islands (+1-649)" },
    { code: "+688", label: "Tuvalu (+688)" },
    { code: "+1-340", label: "U.S. Virgin Islands (+1-340)" },
    { code: "+256", label: "Uganda (+256)" },
    { code: "+380", label: "Ukraine (+380)" },
    { code: "+971", label: "United Arab Emirates (+971)" },
    { code: "+44", label: "United Kingdom (+44)" },
    { code: "+1", label: "United States (+1)" },
    { code: "+598", label: "Uruguay (+598)" },
    { code: "+998", label: "Uzbekistan (+998)" },
    { code: "+678", label: "Vanuatu (+678)" },
    { code: "+379", label: "Vatican (+379)" },
    { code: "+58", label: "Venezuela (+58)" },
    { code: "+84", label: "Vietnam (+84)" },
    { code: "+681", label: "Wallis and Futuna (+681)" },
    { code: "+212", label: "Western Sahara (+212)" },
    { code: "+967", label: "Yemen (+967)" },
    { code: "+260", label: "Zambia (+260)" },
    { code: "+263", label: "Zimbabwe (+263)" }
]

export default function UserForm({ user }: { user?: any }) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Parent State
    const [phone1, setPhone1] = useState(user?.profile?.phone || "")
    const [phone2, setPhone2] = useState(user?.profile?.phone2 || "")

    // Students State
    const [students, setStudents] = useState<any[]>(user?.students || [])
    const [activeTab, setActiveTab] = useState<string>("parent")

    const addStudent = () => {
        const newId = `new-${Date.now()}`
        setStudents([...students, {
            id: newId,
            name: "",
            studentCode: "",
            dob: "",
            level: 1,
            medicalInfo: "",
            waiverSigned: false,
            waiverFile: ""
        }])
        setActiveTab(newId)
    }

    const removeStudent = (index: number) => {
        const studentId = students[index].id
        const newStudents = [...students]
        newStudents.splice(index, 1)
        setStudents(newStudents)
        if (activeTab === studentId || activeTab === index.toString()) {
            setActiveTab("parent")
        }
    }

    const updateStudent = (index: number, field: string, value: any) => {
        const newStudents = [...students]
        newStudents[index] = { ...newStudents[index], [field]: value }
        setStudents(newStudents)
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            role: "PARENT",
            phone: phone1,
            phone2: phone2,
            marketingSource: formData.get('marketingSource'),
            trialDate: formData.get('trialDate'),
            students: students // Pass updated student objects
        }

        const result = user
            ? await updateUserWithFamily(user.id, data)
            : await createUserWithFamily(data)

        if (result.success) {
            toast({ title: user ? "User Updated" : "User Created" })
            router.push("/dashboard/users")
            router.refresh()
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8 max-w-4xl mx-auto pb-20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
                        <TabsTrigger value="parent" className="gap-2 px-4 py-2">
                            <User className="w-4 h-4" />
                            Parent / Family
                        </TabsTrigger>
                        {students.map((student, index) => (
                            <TabsTrigger key={student.id || index} value={student.id || index.toString()} className="gap-2 px-4 py-2">
                                <Users className="w-4 h-4" />
                                {student.name || `Student ${index + 1}`}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <Button type="button" onClick={addStudent} size="sm" variant="outline" className="h-9">
                        <Plus className="mr-2 h-4 w-4" /> Add Kid
                    </Button>
                </div>

                <TabsContent value="parent" className="animate-in fade-in slide-in-from-top-4 duration-300 outline-none">
                    <div className="bg-card p-6 md:p-8 rounded-xl border shadow-sm space-y-6">
                        <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Parent / Guardian Details
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Parent Full Name *</Label>
                                <Input name="name" id="name" defaultValue={user?.name} required placeholder="e.g. John Doe" />
                            </div>
                            <div>
                                <Label htmlFor="email">Email Address *</Label>
                                <Input name="email" id="email" type="email" defaultValue={user?.email} required placeholder="e.g. john@example.com" />
                            </div>

                            {/* Phone 1 */}
                            <div>
                                <Label>Contact Number (1) *</Label>
                                <Input
                                    value={phone1}
                                    onChange={e => setPhone1(e.target.value)}
                                    placeholder="+60123456789"
                                    required
                                />
                            </div>

                            {/* Phone 2 */}
                            <div>
                                <Label>Contact Number (2)</Label>
                                <Input
                                    value={phone2}
                                    onChange={e => setPhone2(e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>

                            <div>
                                <Label htmlFor="marketingSource">Where did you hear about us?</Label>
                                <Select name="marketingSource" defaultValue={user?.profile?.marketingSource || "Google"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Google">Google Search</SelectItem>
                                        <SelectItem value="Instagram">Instagram / Facebook</SelectItem>
                                        <SelectItem value="Friend">Friend Referral</SelectItem>
                                        <SelectItem value="WalkIn">Walk In</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="trialDate">Date for Trial Class</Label>
                                <Input
                                    type="date"
                                    name="trialDate"
                                    id="trialDate"
                                    defaultValue={user?.profile?.trialDate ? format(new Date(user.profile.trialDate), 'yyyy-MM-dd') : ''}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {students.map((student, index) => (
                    <TabsContent
                        key={student.id || index}
                        value={student.id || index.toString()}
                        className="animate-in fade-in slide-in-from-top-4 duration-300 outline-none"
                    >
                        <div className="bg-card p-6 md:p-8 rounded-xl border shadow-sm relative">
                            <div className="flex items-center justify-between border-b pb-4 mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    Editing: {student.name || `Student ${index + 1}`}
                                </h3>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => removeStudent(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Remove Student
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label>Student Full Name</Label>
                                    <Input
                                        value={student.name}
                                        onChange={e => updateStudent(index, 'name', e.target.value)}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Label>Student ID (Optional)</Label>
                                        <Input
                                            value={student.studentCode || ''}
                                            onChange={e => updateStudent(index, 'studentCode', e.target.value)}
                                            placeholder="PK..."
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Label>Level</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={student.level || 1}
                                            onChange={e => updateStudent(index, 'level', parseInt(e.target.value))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Label>Date of Birth</Label>
                                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                            {student.dob ? (() => {
                                                const age = new Date().getFullYear() - new Date(student.dob).getFullYear()
                                                const m = new Date().getMonth() - new Date(student.dob).getMonth()
                                                const finalAge = (m < 0 || (m === 0 && new Date().getDate() < new Date(student.dob).getDate())) ? age - 1 : age
                                                return finalAge >= 0 ? `${finalAge} years old` : 'Invalid Date'
                                            })() : 'Age --'}
                                        </span>
                                    </div>
                                    <Input
                                        type="date"
                                        value={student.dob ? format(new Date(student.dob), 'yyyy-MM-dd') : ''}
                                        onChange={e => updateStudent(index, 'dob', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-muted-foreground" />
                                        Health / Medical Concerns
                                    </Label>
                                    <Textarea
                                        className="mt-2"
                                        value={student.medicalInfo || ''}
                                        onChange={e => updateStudent(index, 'medicalInfo', e.target.value)}
                                        placeholder="Physical/mental concerns we should know about..."
                                    />
                                </div>

                                <div className="md:col-span-2 border-t pt-6">
                                    <Label className="block mb-4 font-semibold text-base">Waiver & Documentation</Label>
                                    <div className="flex items-center gap-4 mb-6 bg-muted/30 p-4 rounded-lg border">
                                        <Checkbox
                                            id={`waiver-${index}`}
                                            checked={student.waiverSigned}
                                            onChange={(e) => updateStudent(index, 'waiverSigned', e.target.checked)}
                                        />
                                        <Label htmlFor={`waiver-${index}`} className="font-medium cursor-pointer flex-1">
                                            Waiver has been signed and verified
                                        </Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Upload Signed Waiver (PDF or Image)</Label>
                                        <ImageUpload
                                            value={student.waiverFile ? [student.waiverFile] : []}
                                            onChange={(urls: string[]) => updateStudent(index, 'waiverFile', urls[0] || "")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {students.length === 0 && activeTab === "parent" && (
                <div className="text-center p-12 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground animate-in zoom-in-95 duration-300">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No kids added yet.</p>
                    <p className="text-sm mb-6">Click "Add Kid" to register a student for this family.</p>
                    <Button type="button" onClick={addStudent} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Student
                    </Button>
                </div>
            )}

            <div className="flex justify-end gap-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : user ? "Update Family" : "Create Family"}
                </Button>
            </div>
        </form>
    )
}

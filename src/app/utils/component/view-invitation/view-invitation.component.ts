import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslaterService } from "../../service/translater.service";
import { common } from "../../../constants/common";
import { environment } from "../../../../environments/environment";
import { LocalStorageService } from "../../service/localStorage.service";
import { AccountService } from "../../../account-settings/account.service";

@Component({
  templateUrl: "./view-invitation.component.html",
  styleUrls: ["./view-invitation.component.scss"],
})
export class ViewInvitationModalComponent {
  params = {};
  editorApiKey = environment.editorApiKey;
  editorConfig = common.editorConifg;
  emailEnContent = "";
  emailFrContent = "";
  emailSubject;
  emailFrSubject;
  emailEnSubject;
  language;
  emailTemplate;
  constructor(
    private dialogRef: MatDialogRef<ViewInvitationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translater: TranslaterService,
    private localStorageService: LocalStorageService,
    private accountService: AccountService,
  ) {
    if (data) {
      this.params = data.params;
    }
  }

  ngOnInit() {
    this.language = this.localStorageService.getItem("language") || {};
    this.accountService.getEmailTemplate().subscribe(
      (res: any) => {
        let english_email_template = res.data.english_email_template;
        let french_email_template = res.data.french_email_template;
        this.emailEnSubject = res.data.subject;
        this.emailFrSubject = res.data.fr_subject;
        this.emailEnContent = english_email_template
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
        this.emailFrContent = french_email_template
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
      },
      (err) => {
      }
    );
  }

  confirm() {
    const body = {
      enEmailBody:this.emailEnContent,
      frEmailBody:this.emailFrContent,
      enSubject: this.emailEnSubject,
      frSubject: this.emailFrSubject,
    };
    this.dialogRef.close(body);
  }

  cancel() {
    this.dialogRef.close();
  }
}

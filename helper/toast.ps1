# Show a Windows toast. Title and body come from environment variables, so no text is ever pasted into the script.
$ErrorActionPreference = 'Stop'
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
$xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
$texts = $xml.GetElementsByTagName('text')
$texts.Item(0).AppendChild($xml.CreateTextNode($env:LVJI_TITLE)) | Out-Null
$texts.Item(1).AppendChild($xml.CreateTextNode($env:LVJI_BODY)) | Out-Null
# Clicking the toast opens this local page (only http://127.0.0.1 addresses are accepted).
if ($env:LVJI_URL -and $env:LVJI_URL.StartsWith('http://127.0.0.1:')) {
  $xml.DocumentElement.SetAttribute('launch', $env:LVJI_URL)
  $xml.DocumentElement.SetAttribute('activationType', 'protocol')
}
$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
$appId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)

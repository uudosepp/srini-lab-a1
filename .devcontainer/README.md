# Devcontainer

Dokumendi nõue: **lab käivitub devcontaineris ühe käsuga**. Sama asi, mida
koolituse 1. osa õpetab — agent töötab konteineris, mitte arendaja masinas.

Kolm asja on siin tahtlikult nii:

| seade | miks |
|---|---|
| `--cap-drop=ALL`, `no-new-privileges` | vähimad õigused; `curl \| sh` tüüpi käsk ei muuda hostmasinat |
| `"mounts": []` | ainult repo on nähtav — SSH-võtmed ja teiste klientide repod mitte |
| pinnitud image-versioon | „silently updated" image jookseks labi õigustega; sama reegel, mis CI-s |

**Mille eest konteiner EI kaitse:** repo ise on sees ja oma töökoopiat saab
rikkuda. Konteiner piirab plahvatuse raadiust, mitte plahvatust.

Väljuva liikluse piiramine (lubatud nimekiri) ei ole siin seadistatud, sest ta
sõltub arendaja võrgust — kliendiprojektis on see devcontaineri osa ja 1. osa
slaid räägib täpselt sellest.
